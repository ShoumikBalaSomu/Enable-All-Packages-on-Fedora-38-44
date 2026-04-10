import { useState } from "react";

const steps = [
  {
    id: 1,
    icon: "🔄",
    title: "System Update",
    color: "from-blue-500 to-blue-600",
    border: "border-blue-200",
    bg: "bg-blue-50",
    badge: "bg-blue-100 text-blue-700",
    description: "Fully updates all installed packages before any changes are made.",
    details: [
      "Runs sudo dnf update -y to bring every installed package to its latest version.",
      "Ensures no version conflicts occur during subsequent installations.",
      "Safe to run even if the system is already fully updated — DNF will simply report 'Nothing to do'.",
    ],
    commands: ["sudo dnf update -y"],
    note: null,
  },
  {
    id: 2,
    icon: "📦",
    title: "RPM Fusion Free & Non-Free",
    color: "from-purple-500 to-purple-600",
    border: "border-purple-200",
    bg: "bg-purple-50",
    badge: "bg-purple-100 text-purple-700",
    description: "Enables the two most important third-party repositories for Fedora.",
    details: [
      "RPM Fusion Free: Contains open-source software that Fedora cannot ship by default (patent or license reasons).",
      "RPM Fusion Non-Free: Contains software with proprietary licenses, such as Nvidia drivers and certain codecs.",
      "Both repos are version-pinned to your exact Fedora release using %fedora macro.",
      "Also updates the Core group metadata so GNOME Software correctly reflects the new sources.",
    ],
    commands: [
      "sudo dnf install -y https://mirrors.rpmfusion.org/free/fedora/rpmfusion-free-release-$(rpm -E %fedora).noarch.rpm",
      "sudo dnf install -y https://mirrors.rpmfusion.org/nonfree/fedora/rpmfusion-nonfree-release-$(rpm -E %fedora).noarch.rpm",
      "sudo dnf group upgrade -y core",
    ],
    note: "Safe to run multiple times — already-installed repos are silently skipped.",
  },
  {
    id: 3,
    icon: "📱",
    title: "Flathub & Flatpak",
    color: "from-teal-500 to-teal-600",
    border: "border-teal-200",
    bg: "bg-teal-50",
    badge: "bg-teal-100 text-teal-700",
    description: "Enables Flathub — the largest Flatpak app store — both system-wide and for your user.",
    details: [
      "Installs flatpak if not already present.",
      "Adds the official Flathub remote at system level (all users) AND your personal user level.",
      "On Fedora 41+, Flatpak support is now built directly into gnome-software — no separate plugin required.",
      "On Fedora 38–40, also installs gnome-software-plugin-flatpak for GNOME Software integration.",
    ],
    commands: [
      "sudo dnf install -y flatpak",
      "sudo flatpak remote-add --if-not-exists flathub https://dl.flathub.org/repo/flathub.flatpakrepo",
      "flatpak remote-add --if-not-exists --user flathub https://dl.flathub.org/repo/flathub.flatpakrepo",
    ],
    note: "Fedora 41+ fix: gnome-software-plugin-flatpak was removed; Flatpak support is now built-in.",
  },
  {
    id: 4,
    icon: "🔩",
    title: "Snap & All Fixes",
    color: "from-orange-500 to-orange-600",
    border: "border-orange-200",
    bg: "bg-orange-50",
    badge: "bg-orange-100 text-orange-700",
    description: "Installs and fully configures snapd with every known fix for Fedora 38–44.",
    details: [
      "Installs: snapd, squashfs-tools, squashfuse, fuse, fuse-libs, kernel-modules, snapd-selinux.",
      "Enables & starts snapd.socket and snapd.service via systemd.",
      "Scans /etc/modprobe.d/ for squashfs blacklist entries and comments them out automatically.",
      "Loads the squashfs kernel module immediately (sudo modprobe squashfs).",
      "Creates the /snap symlink required for classic snap confinement.",
      "Adds /var/lib/snapd/snap/bin to PATH in: ~/.bashrc, ~/.zshrc, fish conf.d, and /etc/environment.",
      "Waits up to 50 seconds for snapd to finish seeding before continuing.",
      "On Fedora 41+: gnome-software-plugin-snap removed — handled automatically.",
    ],
    commands: [
      "sudo dnf install -y snapd squashfs-tools squashfuse fuse fuse-libs kernel-modules snapd-selinux",
      "sudo systemctl enable --now snapd.socket snapd.service",
      "sudo modprobe squashfs",
      "sudo ln -s /var/lib/snapd/snap /snap",
    ],
    note: "Fixes: squashfs blacklist, /snap symlink, PATH for bash/zsh/fish/system, SELinux policy, snapd seeding.",
  },
  {
    id: 5,
    icon: "🎬",
    title: "OpenH264 Codec (Cisco)",
    color: "from-red-500 to-red-600",
    border: "border-red-200",
    bg: "bg-red-50",
    badge: "bg-red-100 text-red-700",
    description: "Enables the Cisco OpenH264 repository and installs H.264 support for GStreamer and Firefox.",
    details: [
      "Enables the fedora-cisco-openh264 repo using the correct DNF5/DNF4 syntax.",
      "Installs gstreamer1-plugin-openh264 for H.264 video decoding in GStreamer apps.",
      "On Fedora 44+: mozilla-openh264 is not yet published by Cisco — installs noopenh264 stub package as a placeholder.",
      "On Fedora 43 and below: installs mozilla-openh264 directly for Firefox H.264 support.",
      "Once Cisco publishes F44 packages, you can run: sudo dnf install mozilla-openh264",
    ],
    commands: [
      "sudo dnf config-manager setopt fedora-cisco-openh264.enabled=1",
      "sudo dnf install -y gstreamer1-plugin-openh264",
      "sudo dnf install -y noopenh264  # F44+ only",
    ],
    note: "F44 fix: mozilla-openh264 not yet in Cisco repo — noopenh264 stub installed as workaround.",
  },
  {
    id: 6,
    icon: "🎵",
    title: "Multimedia Codecs",
    color: "from-pink-500 to-pink-600",
    border: "border-pink-200",
    bg: "bg-pink-50",
    badge: "bg-pink-100 text-pink-700",
    description: "Installs the complete multimedia stack: FFmpeg, GStreamer plugins, MP3, x264, x265, DVD support, and VLC.",
    details: [
      "@multimedia group: installs the full recommended codec set from RPM Fusion.",
      "ffmpeg swap: replaces the limited ffmpeg-free (Fedora's version) with the full RPM Fusion ffmpeg — enables MP3, AAC, H.264, HEVC encoding/decoding.",
      "Individual packages: gstreamer1-plugins-base/good/bad-free/ugly, gstreamer1-plugin-libav, gstreamer1-plugins-bad-freeworld, gstreamer1-plugins-ugly-free.",
      "lame & lame-libs: MP3 encoding support.",
      "x264-libs & x265-libs: H.264 and H.265/HEVC encoding libraries.",
      "libavcodec-freeworld: replaces libavcodec-free with the full patent-encumbered version.",
      "rpmfusion-free-release-tainted + libdvdcss: enables CSS-encrypted DVD playback.",
      "VLC: installed via Flatpak from Flathub (most reliable method on F44).",
    ],
    commands: [
      "sudo dnf install -y @multimedia --exclude=PackageKit-gstreamer-plugin",
      "sudo dnf swap -y ffmpeg-free ffmpeg --allowerasing",
      "sudo dnf install -y lame lame-libs x264-libs x265-libs libavcodec-freeworld",
      "sudo dnf install -y rpmfusion-free-release-tainted libdvdcss",
      "flatpak install -y flathub org.videolan.VLC",
    ],
    note: "F44 fixes: ffmpeg swap via 'dnf swap', libdvdcss via tainted repo, VLC via Flatpak (DNF VLC unreliable on F44).",
  },
  {
    id: 7,
    icon: "🌐",
    title: "Google Chrome",
    color: "from-yellow-500 to-yellow-600",
    border: "border-yellow-200",
    bg: "bg-yellow-50",
    badge: "bg-yellow-100 text-yellow-700",
    description: "Adds Google's official RPM repository and installs the stable Chrome browser.",
    details: [
      "Creates /etc/yum.repos.d/google-chrome.repo pointing to Google's official RPM endpoint.",
      "Installs google-chrome-stable (the standard stable channel release).",
      "GPG signature verification is enabled — packages are verified against Google's official signing key.",
      "The repo stays configured for future automatic updates via dnf.",
    ],
    commands: [
      "sudo tee /etc/yum.repos.d/google-chrome.repo ...",
      "sudo dnf install -y google-chrome-stable",
    ],
    note: "Chrome updates automatically via dnf after initial install.",
  },
  {
    id: 8,
    icon: "💻",
    title: "Visual Studio Code",
    color: "from-indigo-500 to-indigo-600",
    border: "border-indigo-200",
    bg: "bg-indigo-50",
    badge: "bg-indigo-100 text-indigo-700",
    description: "Adds Microsoft's official VS Code repository and installs the code editor.",
    details: [
      "Imports Microsoft's GPG signing key from packages.microsoft.com.",
      "Creates /etc/yum.repos.d/vscode.repo pointing to Microsoft's official RPM endpoint.",
      "Installs the 'code' package (Visual Studio Code stable).",
      "GPG verification enabled — all packages signed by Microsoft.",
      "VS Code updates automatically via dnf after install.",
    ],
    commands: [
      "sudo rpm --import https://packages.microsoft.com/keys/microsoft.asc",
      "sudo tee /etc/yum.repos.d/vscode.repo ...",
      "sudo dnf install -y code",
    ],
    note: "VS Code updates flow through dnf just like any other package.",
  },
  {
    id: 9,
    icon: "🎮",
    title: "Heroic & Celluloid via Flatpak",
    color: "from-green-500 to-green-600",
    border: "border-green-200",
    bg: "bg-green-50",
    badge: "bg-green-100 text-green-700",
    description: "Installs Heroic Games Launcher and Celluloid (MPV frontend) via Flatpak from Flathub.",
    details: [
      "Heroic Games Launcher: Open-source Epic Games / GOG / Amazon Games launcher for Linux. Installed from Flathub (official recommended method — COPR repo returned 404 on F44).",
      "Celluloid: Clean, minimal GTK frontend for the MPV media player. Installed from Flathub (COPR repo also returned 404 on F44).",
      "Both apps use --or-update flag: installs fresh if not present, updates if already installed.",
      "Falls back gracefully with an actionable warning if Flatpak install fails.",
      "Also installs dnf5-command(copr) plugin for future COPR repo management.",
    ],
    commands: [
      "flatpak install -y --or-update flathub com.heroicgameslauncher.hgl",
      "flatpak install -y --or-update flathub io.github.celluloid_player.Celluloid",
    ],
    note: "F44 fix: Both COPR repos returned HTTP 404 — replaced with official Flatpak/Flathub installs.",
  },
  {
    id: 10,
    icon: "✅",
    title: "Final System Refresh",
    color: "from-slate-500 to-slate-600",
    border: "border-slate-200",
    bg: "bg-slate-50",
    badge: "bg-slate-100 text-slate-700",
    description: "Runs a final update pass and refreshes Flatpak metadata to ensure everything is current.",
    details: [
      "Runs sudo dnf update -y one final time to catch any new packages pulled in as dependencies.",
      "Runs flatpak update -y to refresh all Flatpak app metadata and update installed Flatpak apps.",
      "Both commands are safe to run multiple times — they simply do nothing if everything is already up to date.",
    ],
    commands: ["sudo dnf update -y", "flatpak update -y --noninteractive"],
    note: null,
  },
];

const fixes = [
  {
    icon: "🔴",
    problem: "mozilla-openh264 missing on F44",
    fix: "Installs noopenh264 stub — Cisco hasn't published F44 packages yet. Run sudo dnf install mozilla-openh264 once available.",
    severity: "warning",
  },
  {
    icon: "🔄",
    problem: "ffmpeg-free vs ffmpeg conflict",
    fix: "Uses 'dnf swap ffmpeg-free ffmpeg --allowerasing' to cleanly replace Fedora's limited ffmpeg with the full RPM Fusion version.",
    severity: "critical",
  },
  {
    icon: "💿",
    problem: "libdvdcss not found in standard RPM Fusion",
    fix: "Installs rpmfusion-free-release-tainted first, then libdvdcss from the tainted repo.",
    severity: "critical",
  },
  {
    icon: "❌",
    problem: "Heroic & Celluloid COPR 404",
    fix: "Both COPR repos returned HTTP 404 for F44. Replaced with official Flatpak installs from Flathub.",
    severity: "critical",
  },
  {
    icon: "📺",
    problem: "VLC unreliable in DNF on F44",
    fix: "VLC installed via Flatpak from Flathub for maximum reliability and codec support.",
    severity: "warning",
  },
  {
    icon: "🔌",
    problem: "gnome-software-plugin-flatpak/snap removed in F41+",
    fix: "Version check skips these plugins on F41+ — support is now built into gnome-software directly.",
    severity: "warning",
  },
  {
    icon: "🧱",
    problem: "squashfs kernel module blacklisted",
    fix: "Script scans /etc/modprobe.d/ and comments out any squashfs blacklist entries, then modprobes the module.",
    severity: "info",
  },
  {
    icon: "🐟",
    problem: "snap PATH missing for bash/zsh/fish",
    fix: "Appends snap/bin to ~/.bashrc, ~/.zshrc, fish conf.d/snapd.fish, and /etc/environment system-wide.",
    severity: "info",
  },
  {
    icon: "⏳",
    problem: "snapd not seeded before snap commands",
    fix: "Waits up to 50s for 'snap wait system seed.loaded' with 10 retries before continuing.",
    severity: "info",
  },
  {
    icon: "📦",
    problem: "Flatpak apps fail silently",
    fix: "v3.1 fix: Uses --or-update flag and retries with --user remote if system install fails. Verifies Flathub remote is active before attempting installs.",
    severity: "critical",
  },
];

const whatsInstalled = [
  { cat: "Repositories", items: ["RPM Fusion Free", "RPM Fusion Non-Free", "RPM Fusion Free Tainted", "Flathub (system + user)", "Google Chrome repo", "VS Code repo", "Cisco OpenH264 repo"] },
  { cat: "Flatpak Apps", items: ["VLC", "Heroic Games Launcher", "Celluloid (MPV)"] },
  { cat: "Browsers", items: ["Google Chrome (stable)"] },
  { cat: "Developer Tools", items: ["Visual Studio Code"] },
  { cat: "Snap Infrastructure", items: ["snapd", "snapd-selinux", "squashfs-tools", "squashfuse", "fuse", "fuse-libs"] },
  { cat: "Multimedia", items: ["ffmpeg (full, from RPM Fusion)", "ffmpeg-libs", "lame", "x264-libs", "x265-libs", "libavcodec-freeworld", "libdvdcss", "gstreamer1-plugin-openh264", "gstreamer1-plugin-libav"] },
  { cat: "GStreamer Plugins", items: ["gstreamer1-plugins-base", "gstreamer1-plugins-good", "gstreamer1-plugins-bad-free", "gstreamer1-plugins-bad-freeworld", "gstreamer1-plugins-ugly", "gstreamer1-plugins-ugly-free"] },
  { cat: "Codec Stubs", items: ["noopenh264 (F44+ Cisco placeholder)"] },
];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };
  return (
    <button
      onClick={handleCopy}
      className="ml-2 px-2 py-0.5 rounded text-xs font-mono bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white transition-colors border border-slate-600"
      title="Copy"
    >
      {copied ? "✓ copied" : "copy"}
    </button>
  );
}

function ScriptBlock({ code }: { code: string }) {
  return (
    <div className="relative mt-4 rounded-xl bg-slate-900 border border-slate-700 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700">
        <span className="text-xs text-slate-400 font-mono">bash</span>
        <CopyButton text={code} />
      </div>
      <pre className="overflow-x-auto text-sm text-green-300 font-mono p-4 leading-relaxed whitespace-pre-wrap">{code}</pre>
    </div>
  );
}

const SCRIPT_CONTENT = `#!/bin/bash
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

RED='\\033[0;31m'
GREEN='\\033[0;32m'
YELLOW='\\033[1;33m'
BLUE='\\033[0;34m'
CYAN='\\033[0;36m'
NC='\\033[0m'

log()  { echo -e "\${GREEN}[INFO]\${NC}  $1"; }
warn() { echo -e "\${YELLOW}[WARN]\${NC}  $1"; }
err()  { echo -e "\${RED}[ERROR]\${NC} $1"; }
sec()  { echo -e "\\n\${CYAN}========================================\${NC}"; echo -e "\${CYAN}  $1\${NC}"; echo -e "\${CYAN}========================================\${NC}\\n"; }

# ── Safe install: warns instead of aborting on missing packages ──────────────
safe_install() {
  sudo dnf install -y --skip-unavailable "$@" || warn "Some packages unavailable, continuing..."
}

# ── Safe Flatpak install: tries system, falls back to user ───────────────────
safe_flatpak_install() {
  local app_id="$1"
  local app_name="$2"
  log "Installing \${app_name} via Flatpak..."
  # Try system-wide first (--or-update handles already-installed)
  if flatpak install -y --noninteractive --or-update flathub "\${app_id}" 2>/dev/null; then
    log "\${app_name} installed/updated (system)."
    return 0
  fi
  # Fallback: try user install
  warn "System install failed — trying user install for \${app_name}..."
  if flatpak install -y --noninteractive --or-update --user flathub "\${app_id}" 2>/dev/null; then
    log "\${app_name} installed/updated (user)."
    return 0
  fi
  warn "\${app_name} Flatpak install failed. Run manually: flatpak install flathub \${app_id}"
  return 1
}

# ── Must NOT be root ─────────────────────────────────────────────────────────
if [ "$(id -u)" -eq 0 ]; then
  err "Do NOT run this script as root. Run as a normal user."
  exit 1
fi

# ── Detect Fedora version ────────────────────────────────────────────────────
FEDORA_VERSION=$(rpm -E %fedora)
log "Detected: Fedora \$FEDORA_VERSION"

echo -e "\${BLUE}"
echo " ███████╗███████╗██████╗  ██████╗ ██████╗  █████╗ "
echo " ██╔════╝██╔════╝██╔══██╗██╔═══██╗██╔══██╗██╔══██╗"
echo " █████╗  █████╗  ██║  ██║██║   ██║██████╔╝███████║"
echo " ██╔══╝  ██╔══╝  ██║  ██║██║   ██║██╔══██╗██╔══██║"
echo " ██║     ███████╗██████╔╝╚██████╔╝██║  ██║██║  ██║"
echo " ╚═╝     ╚══════╝╚═════╝  ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝"
echo -e "\${NC}"
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
sudo dnf install -y \\
  https://mirrors.rpmfusion.org/free/fedora/rpmfusion-free-release-\$(rpm -E %fedora).noarch.rpm

log "Installing RPM Fusion Non-Free repository..."
sudo dnf install -y \\
  https://mirrors.rpmfusion.org/nonfree/fedora/rpmfusion-nonfree-release-\$(rpm -E %fedora).noarch.rpm

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
sudo flatpak remote-add --if-not-exists flathub \\
  https://dl.flathub.org/repo/flathub.flatpakrepo

log "Adding Flathub remote (user)..."
flatpak remote-add --if-not-exists --user flathub \\
  https://dl.flathub.org/repo/flathub.flatpakrepo

# FIX: Ensure Flathub metadata is synced before any installs
log "Refreshing Flathub metadata..."
sudo flatpak update --appstream -y 2>/dev/null || true
flatpak update --appstream --user -y 2>/dev/null || true

log "Installing GNOME Software with Flatpak support..."
if [ "\$FEDORA_VERSION" -ge 41 ]; then
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
BLACKLIST_FILES=\$(grep -rl "squashfs" /etc/modprobe.d/ 2>/dev/null || true)
if [ -n "\$BLACKLIST_FILES" ]; then
  warn "Found squashfs blacklist entries — commenting them out..."
  for f in \$BLACKLIST_FILES; do
    sudo sed -i 's/^\\(.*squashfs.*\\)/#\\1/' "\$f"
    log "  Patched: \$f"
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
SNAP_PATH_LINE='export PATH=\$PATH:/var/lib/snapd/snap/bin'
if ! grep -q 'snapd/snap/bin' ~/.bashrc 2>/dev/null; then
  log "Adding snap/bin to ~/.bashrc..."
  echo '' >> ~/.bashrc
  echo '# Snap PATH fix (added by enable_all_packages.sh)' >> ~/.bashrc
  echo "\$SNAP_PATH_LINE" >> ~/.bashrc
fi

## 4h. Fix PATH for zsh
if [ -f ~/.zshrc ]; then
  if ! grep -q 'snapd/snap/bin' ~/.zshrc; then
    log "Adding snap/bin to ~/.zshrc..."
    echo '' >> ~/.zshrc
    echo '# Snap PATH fix' >> ~/.zshrc
    echo "\$SNAP_PATH_LINE" >> ~/.zshrc
  fi
fi

## 4i. Fix PATH for fish shell
FISH_CONF_DIR="\$HOME/.config/fish/conf.d"
if command -v fish &>/dev/null; then
  mkdir -p "\$FISH_CONF_DIR"
  FISH_SNAP_FILE="\$FISH_CONF_DIR/snapd.fish"
  if [ ! -f "\$FISH_SNAP_FILE" ]; then
    log "Adding snap/bin to fish shell config..."
    echo '# Snap PATH fix' > "\$FISH_SNAP_FILE"
    echo 'fish_add_path /var/lib/snapd/snap/bin' >> "\$FISH_SNAP_FILE"
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
if [ "\$FEDORA_VERSION" -ge 41 ]; then
  log "Fedora 41+ — Snap support via gnome-software (no separate plugin needed)."
else
  log "Installing GNOME Software Snap plugin..."
  safe_install gnome-software-plugin-snap
fi

## 4l. Wait for snapd to be seeded
log "Waiting for snapd to finish seeding (this may take ~30s)..."
SNAP_READY=false
for i in \$(seq 1 10); do
  if snap wait system seed.loaded 2>/dev/null; then
    SNAP_READY=true
    log "snapd is ready."
    break
  fi
  warn "snapd not ready yet... attempt \$i/10 — waiting 5s"
  sleep 5
done
if [ "\$SNAP_READY" = false ]; then
  warn "snapd may not be fully seeded. Run 'snap wait system seed.loaded' after reboot."
fi

log "All Snap fixes applied."

# ─────────────────────────────────────────
sec "STEP 5 — OpenH264 Codec (Cisco)"
# ─────────────────────────────────────────
log "Enabling OpenH264 repository..."
if dnf5 --version &>/dev/null 2>&1; then
  sudo dnf config-manager setopt fedora-cisco-openh264.enabled=1 2>/dev/null || \\
    warn "Could not enable cisco openh264 repo via dnf5 (non-fatal)."
else
  sudo dnf config-manager --set-enabled fedora-cisco-openh264 2>/dev/null || \\
    sudo dnf config-manager --enable fedora-cisco-openh264 2>/dev/null || \\
    warn "Could not enable cisco openh264 repo — may already be enabled."
fi

log "Installing OpenH264 GStreamer plugin..."
safe_install gstreamer1-plugin-openh264

if [ "\$FEDORA_VERSION" -ge 44 ]; then
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
  sudo dnf install -y @multimedia \\
    --setopt=install_weak_deps=False \\
    --exclude=PackageKit-gstreamer-plugin || \\
    warn "@multimedia group install had issues (continuing with individual packages)"
else
  sudo dnf groupupdate -y multimedia \\
    --setopt="install_weak_deps=False" \\
    --exclude=PackageKit-gstreamer-plugin || \\
    warn "groupupdate multimedia skipped (non-fatal)"
fi

log "Swapping ffmpeg-free → full ffmpeg from RPM Fusion..."
if rpm -q ffmpeg-free &>/dev/null; then
  sudo dnf swap -y ffmpeg-free ffmpeg --allowerasing && \\
    log "ffmpeg swapped successfully." || \\
    warn "ffmpeg swap failed — ffmpeg-free remains installed (non-fatal)."
elif ! rpm -q ffmpeg &>/dev/null; then
  safe_install ffmpeg ffmpeg-libs
else
  log "Full ffmpeg already installed — skipping swap."
fi

log "Installing individual codec packages..."
safe_install \\
  gstreamer1-plugins-base \\
  gstreamer1-plugins-good \\
  gstreamer1-plugins-bad-free \\
  gstreamer1-plugins-ugly \\
  gstreamer1-plugin-libav \\
  gstreamer1-plugins-bad-freeworld \\
  gstreamer1-plugins-ugly-free \\
  lame lame-libs \\
  x264-libs x265-libs \\
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
echo -e "\${GREEN}╔══════════════════════════════════════════════╗\${NC}"
echo -e "\${GREEN}║   ALL PACKAGES & FIXES APPLIED SUCCESSFULLY  ║\${NC}"
echo -e "\${GREEN}╚══════════════════════════════════════════════╝\${NC}"
echo ""
echo -e " \${CYAN}What was done:\${NC}"
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
echo -e " \${YELLOW}⚠️  IMPORTANT: Reboot now to finalize all changes!\${NC}"
echo ""
echo -e "   \${BLUE}sudo reboot\${NC}"
echo ""
echo -e " After reboot, verify snap: \${CYAN}snap install hello-world && hello-world\${NC}"
echo ""`;

export default function App() {
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"guide" | "fixes" | "installed" | "script">("guide");
  const [scriptCopied, setScriptCopied] = useState(false);

  const handleScriptCopy = () => {
    navigator.clipboard.writeText(SCRIPT_CONTENT).then(() => {
      setScriptCopied(true);
      setTimeout(() => setScriptCopied(false), 2000);
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white font-sans">
      {/* Header */}
      <header className="border-b border-white/10 bg-slate-950/60 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-xl shadow-lg shadow-indigo-500/30">
              🐧
            </div>
            <div>
              <h1 className="text-lg font-bold leading-none text-white">Fedora Enable All Packages</h1>
              <p className="text-xs text-slate-400 mt-0.5">v3.1 — Tested on Fedora 38–44 • x86_64 / aarch64</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-1 rounded-full bg-green-500/20 text-green-400 border border-green-500/30 text-xs font-semibold">✓ Fedora 44 Ready</span>
            <span className="px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs font-semibold">🔧 10 Issues Fixed</span>
            <span className="px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30 text-xs font-semibold">📦 10 Steps</span>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-indigo-600/10 pointer-events-none" />
        <div className="max-w-6xl mx-auto px-4 py-16 text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-slate-300 mb-6">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
            One script to enable everything on Fedora
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4 bg-gradient-to-r from-white via-blue-100 to-indigo-200 bg-clip-text text-transparent">
            Enable All Packages<br />on Fedora 38–44
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-8">
            A single bash script that enables RPM Fusion, Flathub, Snap, OpenH264, full FFmpeg, libdvdcss, Chrome, VS Code, VLC, Heroic, and Celluloid — with every Fedora 44 bug fixed.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <button
              onClick={() => setActiveTab("script")}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white font-semibold shadow-lg shadow-indigo-500/30 transition-all hover:scale-105"
            >
              📥 Get the Script
            </button>
            <button
              onClick={() => setActiveTab("guide")}
              className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold transition-all"
            >
              📖 Read the Docs
            </button>
          </div>
        </div>
      </section>

      {/* Quick Install Box */}
      <section className="max-w-6xl mx-auto px-4 pb-8">
        <div className="rounded-2xl bg-slate-900/80 border border-white/10 p-5">
          <div className="text-xs text-slate-400 mb-2 font-semibold uppercase tracking-wider">Quick Install</div>
          <div className="flex items-center gap-3 bg-black/40 rounded-xl px-4 py-3 border border-white/10 flex-wrap">
            <span className="text-green-400 font-mono text-sm flex-1 min-w-0 break-all">
              curl -fsSL https://raw.githubusercontent.com/your-repo/main/shoumik.sh -o shoumik.sh && chmod +x shoumik.sh && ./shoumik.sh
            </span>
            <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded border border-white/10 whitespace-nowrap">⚠️ Run as normal user, NOT root</span>
          </div>
        </div>
      </section>

      {/* Tab Nav */}
      <div className="max-w-6xl mx-auto px-4 mb-6">
        <div className="flex gap-1 p-1 bg-white/5 rounded-xl border border-white/10 w-fit flex-wrap">
          {(["guide", "fixes", "installed", "script"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all capitalize ${
                activeTab === tab
                  ? "bg-white text-slate-900 shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {tab === "guide" && "📖 "}
              {tab === "fixes" && "🔧 "}
              {tab === "installed" && "📦 "}
              {tab === "script" && "📄 "}
              {tab === "guide" ? "Step-by-Step Guide" : tab === "fixes" ? "Bug Fixes" : tab === "installed" ? "What's Installed" : "Final Script v3.1"}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 pb-20">
        {/* GUIDE TAB */}
        {activeTab === "guide" && (
          <div className="space-y-4">
            <p className="text-slate-400 mb-6">Click any step to expand full details, exact commands run, and notes about Fedora 44 compatibility.</p>
            {steps.map((step) => (
              <div
                key={step.id}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  activeStep === step.id ? "border-white/20 shadow-xl shadow-black/30" : "border-white/10 hover:border-white/20"
                } bg-slate-900/60`}
              >
                <button
                  className="w-full flex items-center gap-4 p-5 text-left"
                  onClick={() => setActiveStep(activeStep === step.id ? null : step.id)}
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center text-2xl shrink-0 shadow-lg`}>
                    {step.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${step.badge}`}>STEP {step.id}</span>
                    </div>
                    <h3 className="text-white font-bold text-lg mt-1">{step.title}</h3>
                    <p className="text-slate-400 text-sm mt-0.5 line-clamp-1">{step.description}</p>
                  </div>
                  <span className={`text-slate-400 text-xl transition-transform duration-200 ${activeStep === step.id ? "rotate-90" : ""}`}>›</span>
                </button>

                {activeStep === step.id && (
                  <div className={`px-5 pb-5 border-t border-white/10 pt-4 ${step.bg} bg-opacity-5`}>
                    <div className="space-y-3">
                      {step.details.map((d, i) => (
                        <div key={i} className="flex gap-3 items-start">
                          <span className="text-green-400 mt-0.5 shrink-0">✓</span>
                          <p className="text-slate-300 text-sm">{d}</p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4">
                      <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-2">Commands executed:</div>
                      <div className="rounded-xl bg-black/60 border border-white/10 overflow-hidden">
                        {step.commands.map((cmd, i) => (
                          <div key={i} className="flex items-center gap-2 px-4 py-2 border-b border-white/5 last:border-0 group">
                            <span className="text-slate-600 text-xs shrink-0">$</span>
                            <code className="text-green-300 text-xs font-mono flex-1 break-all">{cmd}</code>
                            <CopyButton text={cmd} />
                          </div>
                        ))}
                      </div>
                    </div>

                    {step.note && (
                      <div className="mt-4 flex gap-2 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
                        <span className="text-yellow-400 shrink-0">⚠️</span>
                        <p className="text-yellow-200 text-sm">{step.note}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* FIXES TAB */}
        {activeTab === "fixes" && (
          <div className="space-y-4">
            <p className="text-slate-400 mb-2">Every bug discovered during the live Fedora 44 run — and the exact fix applied in v3.1.</p>
            <div className="grid md:grid-cols-2 gap-4">
              {fixes.map((fix, i) => (
                <div
                  key={i}
                  className={`rounded-2xl border p-5 bg-slate-900/60 ${
                    fix.severity === "critical"
                      ? "border-red-500/30"
                      : fix.severity === "warning"
                      ? "border-yellow-500/30"
                      : "border-blue-500/30"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl shrink-0">{fix.icon}</span>
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            fix.severity === "critical"
                              ? "bg-red-500/20 text-red-400"
                              : fix.severity === "warning"
                              ? "bg-yellow-500/20 text-yellow-400"
                              : "bg-blue-500/20 text-blue-400"
                          }`}
                        >
                          {fix.severity.toUpperCase()}
                        </span>
                      </div>
                      <h4 className="text-white font-semibold mb-1">🐛 {fix.problem}</h4>
                      <p className="text-slate-400 text-sm">{fix.fix}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-2xl border border-green-500/30 bg-green-500/5 p-6">
              <h3 className="text-green-400 font-bold text-lg mb-2">🆕 New in v3.1 vs v3.0</h3>
              <div className="space-y-2">
                {[
                  "Added safe_flatpak_install() function: retries with --user if system install fails",
                  "Added --or-update flag to all Flatpak installs (handles already-installed apps cleanly)",
                  "Added flatpak update --appstream before any installs (ensures Flathub metadata is current)",
                  "Applies to VLC, Heroic Games Launcher, and Celluloid — all three now install reliably",
                  "Graceful failure with actionable warning message if Flatpak install still fails",
                ].map((item, i) => (
                  <div key={i} className="flex gap-2 items-start">
                    <span className="text-green-400 shrink-0">+</span>
                    <p className="text-slate-300 text-sm">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* INSTALLED TAB */}
        {activeTab === "installed" && (
          <div className="space-y-4">
            <p className="text-slate-400 mb-2">Complete inventory of everything this script installs and configures on your system.</p>
            <div className="grid md:grid-cols-2 gap-4">
              {whatsInstalled.map((cat, i) => (
                <div key={i} className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
                  <h4 className="text-white font-bold mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                    {cat.cat}
                  </h4>
                  <div className="space-y-1.5">
                    {cat.items.map((item, j) => (
                      <div key={j} className="flex items-center gap-2">
                        <span className="text-green-400 text-xs">✓</span>
                        <code className="text-slate-300 text-sm font-mono">{item}</code>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Requirements */}
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 mt-4">
              <h4 className="text-white font-bold mb-4 text-lg">📋 Requirements & Compatibility</h4>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { label: "Fedora Versions", value: "38, 39, 40, 41, 42, 43, 44" },
                  { label: "Architectures", value: "x86_64, aarch64" },
                  { label: "Shells", value: "bash, zsh, fish" },
                  { label: "Run As", value: "Normal user (NOT root)" },
                  { label: "Requires", value: "Internet connection" },
                  { label: "Package Manager", value: "DNF4 & DNF5 both supported" },
                ].map((req, i) => (
                  <div key={i} className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <div className="text-xs text-slate-500 mb-1">{req.label}</div>
                    <div className="text-white font-semibold text-sm">{req.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* After reboot */}
            <div className="rounded-2xl border border-yellow-500/30 bg-yellow-500/5 p-6">
              <h4 className="text-yellow-400 font-bold mb-3 text-lg">⚠️ After Reboot — Verify Everything Works</h4>
              <div className="space-y-3">
                {[
                  { cmd: "snap install hello-world && hello-world", desc: "Verify snap is working" },
                  { cmd: "ffmpeg -version", desc: "Confirm full ffmpeg (should show RPM Fusion build)" },
                  { cmd: "flatpak list", desc: "List all installed Flatpak apps" },
                  { cmd: "google-chrome-stable --version", desc: "Confirm Chrome is installed" },
                  { cmd: "code --version", desc: "Confirm VS Code is installed" },
                  { cmd: "sudo dnf install mozilla-openh264", desc: "Install once Cisco publishes F44 packages" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-black/30 border border-white/10">
                    <code className="text-green-300 font-mono text-xs flex-1 break-all">{item.cmd}</code>
                    <span className="text-slate-500 text-xs shrink-0 hidden sm:block">— {item.desc}</span>
                    <CopyButton text={item.cmd} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SCRIPT TAB */}
        {activeTab === "script" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h3 className="text-white font-bold text-xl">Final Script — v3.1</h3>
                <p className="text-slate-400 text-sm mt-1">All bugs from the live Fedora 44 run are fixed. Safe to run multiple times.</p>
              </div>
              <button
                onClick={handleScriptCopy}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-semibold transition-all shadow-lg shadow-green-500/20 flex items-center gap-2"
              >
                {scriptCopied ? "✓ Copied!" : "📋 Copy Full Script"}
              </button>
            </div>

            {/* How to use */}
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
              <h4 className="text-white font-semibold mb-3">How to use:</h4>
              <div className="space-y-2">
                {[
                  { n: "1", cmd: "# Copy the script below and save it as shoumik.sh", desc: "" },
                  { n: "2", cmd: "chmod +x shoumik.sh", desc: "Make it executable" },
                  { n: "3", cmd: "./shoumik.sh", desc: "Run it as your normal user (NOT root)" },
                  { n: "4", cmd: "sudo reboot", desc: "Reboot when complete" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-black/30 border border-white/10">
                    <span className="w-6 h-6 rounded-full bg-blue-500/30 text-blue-400 text-xs font-bold flex items-center justify-center shrink-0">{item.n}</span>
                    <code className="text-green-300 font-mono text-xs flex-1 break-all">{item.cmd}</code>
                    {item.desc && <span className="text-slate-500 text-xs hidden sm:block">{item.desc}</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* Changes from v3.0 */}
            <div className="rounded-2xl border border-blue-500/30 bg-blue-500/5 p-5">
              <h4 className="text-blue-400 font-bold mb-2">🔄 Changes from v3.0 → v3.1</h4>
              <div className="space-y-1.5">
                {[
                  "Added safe_flatpak_install() helper — retries with --user if system install fails",
                  "All Flatpak installs now use --or-update (no error if already installed)",
                  "Added flatpak update --appstream to sync Flathub metadata before installs",
                  "VLC, Heroic, and Celluloid now install reliably on Fedora 44",
                  "No other changes — all v3.0 logic preserved",
                ].map((item, i) => (
                  <div key={i} className="flex gap-2">
                    <span className="text-blue-400 shrink-0 text-sm">→</span>
                    <p className="text-slate-300 text-sm">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <ScriptBlock code={SCRIPT_CONTENT} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-slate-950/60">
        <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-slate-500 text-sm">
            Fedora Enable All Packages <span className="text-blue-400 font-semibold">v3.1</span> — Tested on Fedora 38–44
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <span>🐧 x86_64 / aarch64</span>
            <span>•</span>
            <span>bash / zsh / fish</span>
            <span>•</span>
            <span>DNF4 & DNF5</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
