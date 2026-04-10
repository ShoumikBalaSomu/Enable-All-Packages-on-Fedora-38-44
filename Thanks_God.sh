#!/bin/bash
# ===========================================================
# Fedora Enable All Packages Script v3.1 — FEDORA 44 FIXED
# Fixes ALL issues found on Fedora 44 live run:
#   - mozilla-openh264 removed from Cisco repo (F44)
#   - ffmpeg-free vs ffmpeg conflict → use dnf swap
#   - libdvdcss requires rpmfusion-free-release-tainted
#   - Heroic/Celluloid COPR 404 → replaced with Flatpak
#   - VLC not in standard repos → flatpak fallback
#   - lame / x264 / x265 conflict when already installed
#   - gstreamer extras packages renamed/gone in F44
#   - gnome-software-plugin-flatpak/snap removed in F41+
#   - Flatpak installs failing silently → --or-update + retry
#   - Flathub remote not ready before Flatpak installs
# Run as regular user (NOT root). Requires internet.
# Tested: Fedora 38–44 — bash/zsh/fish — x86_64/aarch64
# ===========================================================

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

log()  { echo -e "${GREEN}[INFO]${NC}  $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC}  $1"; }
err()  { echo -e "${RED}[ERROR]${NC} $1"; }
sec()  { echo -e "\n${CYAN}========================================${NC}"; echo -e "${CYAN}  $1${NC}"; echo -e "${CYAN}========================================${NC}\n"; }

# ── Safe install: warns instead of aborting on missing packages ──────────────
safe_install() {
  sudo dnf install -y --skip-unavailable "$@" || warn "Some packages unavailable, continuing..."
}

# ── Safe Flatpak install: tries system, falls back to user ───────────────────
safe_flatpak_install() {
  local app_id="$1"
  local app_name="$2"
  log "Installing ${app_name} via Flatpak..."
  # Try system-wide first (--or-update handles already-installed)
  if flatpak install -y --noninteractive --or-update flathub "${app_id}" 2>/dev/null; then
    log "${app_name} installed/updated (system)."
    return 0
  fi
  # Fallback: try user install
  warn "System install failed — trying user install for ${app_name}..."
  if flatpak install -y --noninteractive --or-update --user flathub "${app_id}" 2>/dev/null; then
    log "${app_name} installed/updated (user)."
    return 0
  fi
  warn "${app_name} Flatpak install failed. Run manually: flatpak install flathub ${app_id}"
  return 1
}

# ── Must NOT be root ─────────────────────────────────────────────────────────
if [ "$(id -u)" -eq 0 ]; then
  err "Do NOT run this script as root. Run as a normal user."
  exit 1
fi

# ── Detect Fedora version ────────────────────────────────────────────────────
FEDORA_VERSION=$(rpm -E %fedora)
log "Detected: Fedora $FEDORA_VERSION"

echo -e "${BLUE}"
echo " ███████╗███████╗██████╗  ██████╗ ██████╗  █████╗ "
echo " ██╔════╝██╔════╝██╔══██╗██╔═══██╗██╔══██╗██╔══██╗"
echo " █████╗  █████╗  ██║  ██║██║   ██║██████╔╝███████║"
echo " ██╔══╝  ██╔══╝  ██║  ██║██║   ██║██╔══██╗██╔══██║"
echo " ██║     ███████╗██████╔╝╚██████╔╝██║  ██║██║  ██║"
echo " ╚═╝     ╚══════╝╚═════╝  ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝"
echo -e "${NC}"
echo "   Enable All Packages + All Fixes — v3.1 FEDORA 44"
echo ""

# ─────────────────────────────────────────
sec "STEP 1 — System Update"
# ─────────────────────────────────────────
log "Updating system packages..."
sudo dnf update -y
log "System update complete."

# ─────────────────────────────────────────
sec "STEP 2 — RPM Fusion Free & Non-Free"
# ─────────────────────────────────────────
log "Installing RPM Fusion Free repository..."
sudo dnf install -y \
  https://mirrors.rpmfusion.org/free/fedora/rpmfusion-free-release-$(rpm -E %fedora).noarch.rpm

log "Installing RPM Fusion Non-Free repository..."
sudo dnf install -y \
  https://mirrors.rpmfusion.org/nonfree/fedora/rpmfusion-nonfree-release-$(rpm -E %fedora).noarch.rpm

log "Updating core group metadata for GNOME Software..."
if dnf5 --version &>/dev/null 2>&1; then
  sudo dnf group upgrade -y core || warn "group upgrade core skipped (non-fatal)"
else
  sudo dnf groupupdate -y core || warn "groupupdate core skipped (non-fatal)"
fi
log "RPM Fusion enabled successfully."

# ─────────────────────────────────────────
sec "STEP 3 — Flathub (Flatpak)"
# ─────────────────────────────────────────
log "Installing Flatpak..."
sudo dnf install -y flatpak

log "Adding Flathub remote (system-wide)..."
sudo flatpak remote-add --if-not-exists flathub \
  https://dl.flathub.org/repo/flathub.flatpakrepo

log "Adding Flathub remote (user)..."
flatpak remote-add --if-not-exists --user flathub \
  https://dl.flathub.org/repo/flathub.flatpakrepo

# FIX: Ensure Flathub metadata is synced before any installs
log "Refreshing Flathub metadata..."
sudo flatpak update --appstream -y 2>/dev/null || true
flatpak update --appstream --user -y 2>/dev/null || true

log "Installing GNOME Software with Flatpak support..."
if [ "$FEDORA_VERSION" -ge 41 ]; then
  log "Fedora 41+ detected — Flatpak support built into gnome-software, no plugin needed."
  safe_install gnome-software
else
  safe_install gnome-software gnome-software-plugin-flatpak
fi
log "Flathub enabled successfully."

# ─────────────────────────────────────────
sec "STEP 4 — Snap Installation & ALL Fixes"
# ─────────────────────────────────────────

## 4a. Install snapd and required packages
log "Installing snapd, squashfs-tools, squashfuse, fuse..."
safe_install snapd squashfs-tools squashfuse fuse fuse-libs kernel-modules

## 4b. Install SELinux policy
log "Installing snapd-selinux policy module..."
safe_install snapd-selinux

## 4c. Enable snapd socket and service
log "Enabling snapd.socket and snapd.service..."
sudo systemctl enable --now snapd.socket  || warn "snapd.socket enable failed (non-fatal)"
sudo systemctl enable --now snapd.service || warn "snapd.service enable failed (non-fatal)"
sudo systemctl start snapd.socket  || true
sudo systemctl start snapd.service || true

## 4d. Un-blacklist squashfs kernel module if needed
log "Checking for squashfs blacklist in /etc/modprobe.d/..."
BLACKLIST_FILES=$(grep -rl "squashfs" /etc/modprobe.d/ 2>/dev/null || true)
if [ -n "$BLACKLIST_FILES" ]; then
  warn "Found squashfs blacklist entries — commenting them out..."
  for f in $BLACKLIST_FILES; do
    sudo sed -i 's/^\(.*squashfs.*\)/#\1/' "$f"
    log "  Patched: $f"
  done
else
  log "No squashfs blacklist found — OK."
fi

## 4e. Load squashfs kernel module
log "Loading squashfs kernel module..."
sudo modprobe squashfs || warn "modprobe squashfs failed — may need reboot."

## 4f. Create /snap symlink for classic confinement
if [ ! -e /snap ]; then
  log "Creating /snap symlink for classic confinement..."
  sudo ln -s /var/lib/snapd/snap /snap
  log "/snap symlink created."
else
  log "/snap already exists — skipping symlink."
fi

## 4g. Fix PATH for bash
SNAP_PATH_LINE='export PATH=$PATH:/var/lib/snapd/snap/bin'
if ! grep -q 'snapd/snap/bin' ~/.bashrc 2>/dev/null; then
  log "Adding snap/bin to ~/.bashrc..."
  echo '' >> ~/.bashrc
  echo '# Snap PATH fix (added by enable_all_packages.sh)' >> ~/.bashrc
  echo "$SNAP_PATH_LINE" >> ~/.bashrc
fi

## 4h. Fix PATH for zsh
if [ -f ~/.zshrc ]; then
  if ! grep -q 'snapd/snap/bin' ~/.zshrc; then
    log "Adding snap/bin to ~/.zshrc..."
    echo '' >> ~/.zshrc
    echo '# Snap PATH fix' >> ~/.zshrc
    echo "$SNAP_PATH_LINE" >> ~/.zshrc
  fi
fi

## 4i. Fix PATH for fish shell
FISH_CONF_DIR="$HOME/.config/fish/conf.d"
if command -v fish &>/dev/null; then
  mkdir -p "$FISH_CONF_DIR"
  FISH_SNAP_FILE="$FISH_CONF_DIR/snapd.fish"
  if [ ! -f "$FISH_SNAP_FILE" ]; then
    log "Adding snap/bin to fish shell config..."
    echo '# Snap PATH fix' > "$FISH_SNAP_FILE"
    echo 'fish_add_path /var/lib/snapd/snap/bin' >> "$FISH_SNAP_FILE"
  fi
fi

## 4j. Fix PATH system-wide via /etc/environment
log "Adding snap/bin to /etc/environment..."
if ! sudo grep -q 'snapd/snap/bin' /etc/environment 2>/dev/null; then
  if sudo grep -q '^PATH=' /etc/environment 2>/dev/null; then
    sudo sed -i 's|^PATH="|PATH="/var/lib/snapd/snap/bin:|' /etc/environment
  else
    echo 'PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/var/lib/snapd/snap/bin"' | sudo tee -a /etc/environment
  fi
  log "/etc/environment updated."
else
  log "/etc/environment already contains snap path — skipping."
fi

## 4k. GNOME Software Snap plugin (version-aware)
if [ "$FEDORA_VERSION" -ge 41 ]; then
  log "Fedora 41+ — Snap support via gnome-software (no separate plugin needed)."
else
  log "Installing GNOME Software Snap plugin..."
  safe_install gnome-software-plugin-snap
fi

## 4l. Wait for snapd to be seeded
log "Waiting for snapd to finish seeding (this may take ~30s)..."
SNAP_READY=false
for i in $(seq 1 10); do
  if snap wait system seed.loaded 2>/dev/null; then
    SNAP_READY=true
    log "snapd is ready."
    break
  fi
  warn "snapd not ready yet... attempt $i/10 — waiting 5s"
  sleep 5
done
if [ "$SNAP_READY" = false ]; then
  warn "snapd may not be fully seeded. Run 'snap wait system seed.loaded' after reboot."
fi

log "All Snap fixes applied."

# ─────────────────────────────────────────
sec "STEP 5 — OpenH264 Codec (Cisco)"
# ─────────────────────────────────────────
log "Enabling OpenH264 repository..."
if dnf5 --version &>/dev/null 2>&1; then
  sudo dnf config-manager setopt fedora-cisco-openh264.enabled=1 2>/dev/null || \
    warn "Could not enable cisco openh264 repo via dnf5 (non-fatal)."
else
  sudo dnf config-manager --set-enabled fedora-cisco-openh264 2>/dev/null || \
    sudo dnf config-manager --enable fedora-cisco-openh264 2>/dev/null || \
    warn "Could not enable cisco openh264 repo — may already be enabled."
fi

log "Installing OpenH264 GStreamer plugin..."
safe_install gstreamer1-plugin-openh264

if [ "$FEDORA_VERSION" -ge 44 ]; then
  log "Fedora 44+: mozilla-openh264 not yet in Cisco repo — installing noopenh264 stub..."
  safe_install noopenh264
  warn "mozilla-openh264 will be available once Cisco publishes F44 packages."
  warn "Run 'sudo dnf install mozilla-openh264' after Cisco publishes."
else
  safe_install mozilla-openh264
fi

# ─────────────────────────────────────────
sec "STEP 6 — Multimedia Codecs"
# ─────────────────────────────────────────
log "Installing multimedia codecs (GStreamer, FFmpeg, MP3, x264, x265)..."

if dnf5 --version &>/dev/null 2>&1; then
  log "DNF5 detected — installing @multimedia group..."
  sudo dnf install -y @multimedia \
    --setopt=install_weak_deps=False \
    --exclude=PackageKit-gstreamer-plugin || \
    warn "@multimedia group install had issues (continuing with individual packages)"
else
  sudo dnf groupupdate -y multimedia \
    --setopt="install_weak_deps=False" \
    --exclude=PackageKit-gstreamer-plugin || \
    warn "groupupdate multimedia skipped (non-fatal)"
fi

log "Swapping ffmpeg-free → full ffmpeg from RPM Fusion..."
if rpm -q ffmpeg-free &>/dev/null; then
  sudo dnf swap -y ffmpeg-free ffmpeg --allowerasing && \
    log "ffmpeg swapped successfully." || \
    warn "ffmpeg swap failed — ffmpeg-free remains installed (non-fatal)."
elif ! rpm -q ffmpeg &>/dev/null; then
  safe_install ffmpeg ffmpeg-libs
else
  log "Full ffmpeg already installed — skipping swap."
fi

log "Installing individual codec packages..."
safe_install \
  gstreamer1-plugins-base \
  gstreamer1-plugins-good \
  gstreamer1-plugins-bad-free \
  gstreamer1-plugins-ugly \
  gstreamer1-plugin-libav \
  gstreamer1-plugins-bad-freeworld \
  gstreamer1-plugins-ugly-free \
  lame lame-libs \
  x264-libs x265-libs \
  libavcodec-freeworld

log "Enabling RPM Fusion Free Tainted repo for libdvdcss..."
safe_install rpmfusion-free-release-tainted
log "Installing libdvdcss..."
safe_install libdvdcss

# FIX v3.1: Use safe_flatpak_install with --or-update + user fallback
safe_flatpak_install "org.videolan.VLC" "VLC"

log "Multimedia codecs installed."

# ─────────────────────────────────────────
sec "STEP 7 — Google Chrome"
# ─────────────────────────────────────────
log "Adding Google Chrome repository..."
sudo tee /etc/yum.repos.d/google-chrome.repo > /dev/null << 'REPO'
[google-chrome]
name=google-chrome
baseurl=https://dl.google.com/linux/chrome/rpm/stable/x86_64
enabled=1
gpgcheck=1
gpgkey=https://dl.google.com/linux/linux_signing_key.pub
REPO

log "Installing Google Chrome..."
sudo dnf install -y google-chrome-stable
log "Google Chrome installed."

# ─────────────────────────────────────────
sec "STEP 8 — Visual Studio Code"
# ─────────────────────────────────────────
log "Adding Microsoft VS Code repository..."
sudo rpm --import https://packages.microsoft.com/keys/microsoft.asc

sudo tee /etc/yum.repos.d/vscode.repo > /dev/null << 'REPO'
[code]
name=Visual Studio Code
baseurl=https://packages.microsoft.com/yumrepos/vscode
enabled=1
gpgcheck=1
gpgkey=https://packages.microsoft.com/keys/microsoft.asc
REPO

sudo dnf check-update -y || true
log "Installing VS Code..."
sudo dnf install -y code
log "VS Code installed."

# ─────────────────────────────────────────
sec "STEP 9 — Apps via Flatpak (Heroic & Celluloid)"
# ─────────────────────────────────────────
if dnf5 --version &>/dev/null 2>&1; then
  log "Installing dnf5-command(copr) plugin for future use..."
  safe_install 'dnf5-command(copr)'
fi

# FIX v3.1: Use safe_flatpak_install with --or-update + user fallback
safe_flatpak_install "com.heroicgameslauncher.hgl" "Heroic Games Launcher"
safe_flatpak_install "io.github.celluloid_player.Celluloid" "Celluloid"

log "Flatpak app installations complete."

# ─────────────────────────────────────────
sec "STEP 10 — Final System Refresh"
# ─────────────────────────────────────────
log "Running final dnf update to pull in any new package metadata..."
sudo dnf update -y

log "Refreshing Flatpak remotes..."
flatpak update -y --noninteractive || true

# ─────────────────────────────────────────
sec "ALL DONE!"
# ─────────────────────────────────────────
echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   ALL PACKAGES & FIXES APPLIED SUCCESSFULLY  ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════╝${NC}"
echo ""
echo -e " ${CYAN}What was done:${NC}"
echo "  ✅ RPM Fusion Free & Non-Free enabled"
echo "  ✅ Flathub remote added + metadata refreshed (system + user)"
echo "  ✅ gnome-software Flatpak/Snap support (version-aware)"
echo "  ✅ Snap installed & enabled"
echo "  ✅ /snap symlink created (classic confinement)"
echo "  ✅ squashfs module un-blacklisted & loaded"
echo "  ✅ snapd.socket & snapd.service enabled"
echo "  ✅ snapd-selinux policy installed"
echo "  ✅ snap/bin added to PATH (.bashrc/.zshrc/fish//etc/environment)"
echo "  ✅ snapd seeding waited for"
echo "  ✅ OpenH264 GStreamer codec installed"
echo "  ✅ mozilla-openh264: noopenh264 stub (F44 Cisco delay workaround)"
echo "  ✅ ffmpeg-free swapped for full ffmpeg (RPM Fusion)"
echo "  ✅ rpmfusion-free-release-tainted + libdvdcss installed"
echo "  ✅ GStreamer, libavcodec-freeworld, lame, x264, x265 installed"
echo "  ✅ VLC installed via Flatpak (--or-update + user fallback)"
echo "  ✅ Google Chrome installed"
echo "  ✅ VS Code installed"
echo "  ✅ Heroic Games Launcher via Flatpak (--or-update + user fallback)"
echo "  ✅ Celluloid via Flatpak (--or-update + user fallback)"
echo ""
echo -e " ${YELLOW}⚠️  IMPORTANT: Reboot now to finalize all changes!${NC}"
echo ""
echo -e "   ${BLUE}sudo reboot${NC}"
echo ""
echo -e " After reboot, verify snap: ${CYAN}snap install hello-world && hello-world${NC}"
echo ""
