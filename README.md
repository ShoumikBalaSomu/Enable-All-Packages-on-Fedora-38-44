```markdown
# 🚀 Enable All Packages on Fedora 38–44

> **Thanks_God.sh v3.1** — One command to unlock RPM Fusion, Flatpak, Snap, multimedia codecs, Chrome, VS Code, and 10+ critical fixes. Fully tested and patched for modern Fedora releases.

[![Fedora](https://img.shields.io/badge/Fedora-38--44-3b82f6?style=flat-square&logo=fedora&logoColor=white)](https://getfedora.org/)
[![Version](https://img.shields.io/badge/Version-3.1-purple?style=flat-square)](https://github.com/ShoumikBalaSomu/Enable-All-Packages-on-Fedora-38-44)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)
[![Shell](https://img.shields.io/badge/Shell-Bash-orange?style=flat-square&logo=gnu-bash&logoColor=white)](https://www.gnu.org/software/bash/)

---

## ⚡ One-Liner Installation

```bash
bash <(curl -sL https://raw.githubusercontent.com/ShoumikBalaSomu/Enable-All-Packages-on-Fedora-38-44/main/Thanks_God.sh)
```

> ⚠️ **Run as a regular user, NOT root.** The script will prompt for `sudo` when needed.

---

## ✨ What This Script Automates

| Step | Action | Details |
|:----:|--------|---------|
| 🔹 1 | **System Update** | `sudo dnf update -y` to refresh metadata & apply pending updates |
| 🔹 2 | **RPM Fusion** | Installs Free & Non-Free repos + handles `dnf5`/`dnf` group upgrade logic |
| 🔹 3 | **Flathub + Flatpak** | Adds Flathub (system+user), syncs `appstream`, installs `gnome-software` with version-aware plugins |
| 🔹 4 | **Snap + Kernel Fixes** | Installs `snapd`, un-blacklists `squashfs`, creates `/snap` symlink, patches `.bashrc`/`.zshrc`/`fish`/`/etc/environment`, waits for `snapd` seeding |
| 🔹 5 | **OpenH264 Codec** | Enables Cisco repo, installs GStreamer plugin, uses `noopenh264` stub on F44+ |
| 🔹 6 | **Multimedia Codecs** | Swaps `ffmpeg-free` → full `ffmpeg`, installs GStreamer suite, `lame`, `x264`, `x265`, `libdvdcss` via tainted repo, VLC via Flatpak |
| 🔹 7 | **Google Chrome** | Adds official repo with GPG key, installs `google-chrome-stable` |
| 🔹 8 | **VS Code** | Imports Microsoft key, configures repo, installs `code` |
| 🔹 9 | **Gaming & Media Apps** | Installs Heroic Games Launcher & Celluloid via Flatpak with `--or-update` + user fallback |
| 🔹 10 | **Final Refresh** | Runs `sudo dnf update` + `flatpak update`, prints completion summary & reboot reminder |

---

## 🛠️ Critical Fixes in v3.1 (Live Tested on Fedora 44)

```diff
+ ✅ mozilla-openh264 missing on F44 → installs noopenh264 stub with clear instructions
+ ✅ ffmpeg-free vs ffmpeg conflict → uses `dnf swap --allowerasing` for safe replacement
+ ✅ libdvdcss missing → auto-enables `rpmfusion-free-release-tainted`
+ ✅ Heroic/Celluloid COPR 404 errors → replaced with reliable Flatpak installs
+ ✅ VLC not in standard repos → Flatpak fallback with `--or-update` + user retry
+ ✅ lame/x264/x265 dependency conflicts → `safe_install` with `--skip-unavailable`
+ ✅ gstreamer extras renamed/removed in F44 → conditional package resolution
+ ✅ gnome-software-plugin-flatpak/snap removed in F41+ → version-aware logic
+ ✅ Flatpak silent failures → pre-install `appstream` refresh + system→user fallback
+ ✅ snapd PATH not working → patches bash/zsh/fish AND `/etc/environment`
+ ✅ snapd seeding race condition → 10-attempt retry loop with 5s delay
```

---

## 📋 Compatibility Matrix

| Fedora Version | Status | Notes |
|:--------------:|:------:|-------|
| **Fedora 38**  | ✅ Supported | Fully tested |
| **Fedora 39**  | ✅ Supported | Fully tested |
| **Fedora 40**  | ✅ Supported | Fully tested |
| **Fedora 41**  | ✅ Supported | `gnome-software-plugin-*` skipped (built-in) |
| **Fedora 42**  | ✅ Supported | Fully tested |
| **Fedora 43**  | ✅ Supported | Fully tested |
| **Fedora 44**  | ✅ **Fixed & Tested** | v3.1 includes all F44-specific workarounds |

**Architectures:** `x86_64` • `aarch64`  
**Shells:** `bash` • `zsh` • `fish`

---

## 🚦 Usage Guide

### 1️⃣ Open Terminal
```bash
Ctrl+Alt+T  # or search "Terminal" in Activities
```

### 2️⃣ Run the Script
```bash
bash <(curl -sL https://raw.githubusercontent.com/ShoumikBalaSomu/Enable-All-Packages-on-Fedora-38-44/main/Thanks_God.sh)
```

### 3️⃣ Wait for Completion (~5–15 min)
The script will display colored output with progress:
```
[INFO]  Installing RPM Fusion Free repository...
[INFO]  Adding Flathub remote (system-wide)...
[WARN]  snapd not ready yet... attempt 3/10 — waiting 5s
✅ ALL PACKAGES & FIXES APPLIED SUCCESSFULLY
```

### 4️⃣ Reboot
```bash
sudo reboot
```

### 5️⃣ Verify Installation
```bash
# Check Snap
snap install hello-world && hello-world

# Check Flatpak apps
flatpak list | grep -E "vlc|heroic|celluloid"

# Check versions
google-chrome --version
code --version
ffmpeg -version
```

---

## ❓ Troubleshooting

| Issue | Solution |
|-------|----------|
| `"Do NOT run this script as root"` | Run as a normal user. The script handles `sudo` internally. |
| `"Could not enable cisco openh264 repo"` | Non-fatal. On F44, Cisco hasn't published packages yet. The script installs `noopenh264` as a fallback. |
| `Flatpak apps not showing in GNOME Software` | Run `flatpak update --appstream` then restart GNOME Software. |
| `snap: command not found` | Reload your shell: `source ~/.bashrc` (or `~/.zshrc`). Verify with `which snap`. |
| `ffmpeg swap failed` | If dependencies conflict, the script continues safely. Check with `rpm -q ffmpeg ffmpeg-free`. |
| `snapd seeding timeout` | Normal on slow networks. After reboot, run: `snap wait system seed.loaded` |

---

## 🔐 Security Notes

- ✅ All repos use **HTTPS** + **GPG signature verification**
- ✅ Official signing keys imported for Chrome & VS Code
- ✅ `set -euo pipefail` enforces strict error handling
- ✅ All `sudo` commands are explicit and logged
- ✅ Open source: review before running
  ```bash
  curl -sL https://raw.githubusercontent.com/ShoumikBalaSomu/Enable-All-Packages-on-Fedora-38-44/main/Thanks_God.sh | less
  ```

---

## 🤝 Contributing

1. **Fork** this repository
2. Create a branch: `git checkout -b fix/your-feature`
3. Commit changes: `git commit -m 'fix: handle new package name'`
4. Push & open a **Pull Request**

### 🐛 Reporting Bugs
Please include:
- Fedora version: `rpm -E %fedora`
- Architecture: `uname -m`
- Shell: `echo $SHELL`
- Exact error output (copy-paste)

👉 [Open an Issue](https://github.com/ShoumikBalaSomu/Enable-All-Packages-on-Fedora-38-44/issues)

---

## 📄 License

Released under the [MIT License](LICENSE).

```
MIT License

Copyright (c) 2025 Shoumik Bala Somu

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 👨‍💻 Author & Links

**Shoumik Bala Somu**  
[🔗 GitHub Profile](https://github.com/ShoumikBalaSomu)  
[📦 Repository](https://github.com/ShoumikBalaSomu/Enable-All-Packages-on-Fedora-38-44)

### 🔗 Useful Resources
- 🐧 [Fedora Project](https://getfedora.org/)
- 📦 [RPM Fusion](https://rpmfusion.org/)
- 🧱 [Flathub](https://flathub.org/)
- 📱 [Snapcraft](https://snapcraft.io/)
- 💻 [VS Code Linux Setup](https://code.visualstudio.com/docs/setup/linux)

---

> ⭐ **If this script saved you time, consider starring the repo!** It helps other Fedora users find it.
```
