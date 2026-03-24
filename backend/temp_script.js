
        // ══════════════════════════════════════════════════════
        //  CURSOR
        // ══════════════════════════════════════════════════════
        // ── ROOM NAME — swap this value from your backend / URL param ───────────────
        const ROOM_NAME = (() => {
            const params = new URLSearchParams(window.location.search);
            return params.get('room') || 'sunday jazz hour';
        })();
        document.getElementById('room-name-display').textContent = ROOM_NAME;
        document.getElementById('snap-room-name').textContent = ROOM_NAME + ' · melos.app';
        document.title = 'Melos — ' + ROOM_NAME;

        let W, H, orbs = [], rings = [], grains = [], tt = 0, animId;
        const mouse = { x: -999, y: -999 };
        const cursor = document.getElementById('cursor');
        document.addEventListener('mousemove', e => {
            mouse.x = e.clientX; 
            mouse.y = e.clientY; 
            cursor.style.left = mouse.x + 'px';
            cursor.style.top = mouse.y + 'px';
            if (!cursor.classList.contains('visible')) cursor.classList.add('visible');
            
            const isHover = e.target.closest('button, .btn-glass, .stab, .search-result, .panel-close, .av-node');
            cursor.classList.toggle('hover', !!isHover);
        });
        document.addEventListener('mouseleave', () => {
            mouse.x = -999; mouse.y = -999;
            cursor.classList.remove('visible');
        });

        // ══════════════════════════════════════════════════════
        //  BACKGROUND CANVAS — warm sepia, zero purple
        // ══════════════════════════════════════════════════════
        const bgCanvas = document.getElementById('bg-canvas');
        const ctx = bgCanvas.getContext('2d');

        function resize() {
            W = bgCanvas.width = window.innerWidth;
            H = bgCanvas.height = window.innerHeight;
            buildBg();
        }

        function buildBg() {
            const params = new URLSearchParams(window.location.search);
            const baseColorHex = params.get('color') || '#130C05';

            function hexToRgb(hex) {
                var c = hex.substring(1).split('');
                if(c.length == 3){
                    c= [c[0], c[0], c[1], c[1], c[2], c[2]];
                }
                c= '0x'+c.join('');
                return [(c>>16)&255, (c>>8)&255, c&255];
            }

            function rgbToHex(r,g,b) {
                return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase().padStart(6,'0');
            }
            
            function lighten(hex, percent) {
                let rgb = hexToRgb(hex);
                let r = Math.min(255, Math.floor(rgb[0] + (255 - rgb[0]) * percent));
                let g = Math.min(255, Math.floor(rgb[1] + (255 - rgb[1]) * percent));
                let b = Math.min(255, Math.floor(rgb[2] + (255 - rgb[2]) * percent));
                return rgbToHex(r,g,b);
            }

            window.bgGradient = {
                stop0: baseColorHex,
                stop35: lighten(baseColorHex, 0.05),
                stop65: lighten(baseColorHex, 0.02),
                stop100: lighten(baseColorHex, 0.08)
            };

            const rgb = hexToRgb(baseColorHex);
            const light1 = lighten(baseColorHex, 0.4);
            const rgbL1 = hexToRgb(light1);
            const light2 = lighten(baseColorHex, 0.6);
            
            document.documentElement.style.setProperty('--taskbar-bg', `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.85)`);
            document.documentElement.style.setProperty('--tb-btn-bg', `rgba(${rgbL1[0]}, ${rgbL1[1]}, ${rgbL1[2]}, 0.12)`);
            document.documentElement.style.setProperty('--tb-btn-border', `rgba(${rgbL1[0]}, ${rgbL1[1]}, ${rgbL1[2]}, 0.25)`);
            document.documentElement.style.setProperty('--tb-btn-hover', `rgba(${rgbL1[0]}, ${rgbL1[1]}, ${rgbL1[2]}, 0.25)`);
            document.documentElement.style.setProperty('--tb-btn-border-hover', `rgba(${rgbL1[0]}, ${rgbL1[1]}, ${rgbL1[2]}, 0.45)`);
            document.documentElement.style.setProperty('--tb-icon', light2);

            const disc = document.getElementById('disc');
            if (disc) {
                const c1 = lighten(baseColorHex, 0.04);
                const c2 = lighten(baseColorHex, 0.12);
                const c3 = lighten(baseColorHex, 0.07);
                disc.style.background = `conic-gradient(${c1} 0deg, ${c2} 40deg, ${c3} 80deg, ${c2} 120deg, ${c1} 160deg, ${c3} 200deg, ${c1} 240deg, ${c2} 280deg, ${c3} 320deg, ${c1} 360deg)`;
            }

            const oc = [window.bgGradient.stop0, window.bgGradient.stop35, window.bgGradient.stop65, window.bgGradient.stop100, lighten(baseColorHex, 0.15), lighten(baseColorHex, 0.2), lighten(baseColorHex, 0.25), lighten(baseColorHex, 0.3)];
            orbs = Array.from({ length: 8 }, (_, i) => ({
                x: Math.random() * W, y: Math.random() * H,
                r: 70 + Math.random() * 140,
                vx: (Math.random() - .5) * 0.11, vy: (Math.random() - .5) * 0.11,
                color: oc[i % oc.length],
                opacity: 0.05 + Math.random() * 0.08, _op: 0,
            }));

            rings = Array.from({ length: 16 }, () => ({
                cx: Math.random() * W, cy: Math.random() * H,
                r: 30 + Math.random() * 160,
                speed: 0.0003 + Math.random() * 0.00035,
                phase: Math.random() * Math.PI * 2,
                opacity: 0.022 + Math.random() * 0.046,
                thick: 0.4 + Math.random() * 1.0,
                color: oc[Math.floor(Math.random() * oc.length)],
            }));

            grains = Array.from({ length: 26 }, () => ({
                offset: Math.random() * (W + H),
                thick: 0.3 + Math.random() * 1.1,
                opacity: 0.018 + Math.random() * 0.044,
                speed: (Math.random() - .5) * 0.09,
                color: oc[Math.floor(Math.random() * oc.length)],
                hov: 0,
            }));
        }

        function drawBg() {
            ctx.clearRect(0, 0, W, H);
            
            const bg = ctx.createLinearGradient(0, 0, W, H);
            bg.addColorStop(0, window.bgGradient.stop0);
            bg.addColorStop(0.35, window.bgGradient.stop35);
            bg.addColorStop(0.65, window.bgGradient.stop65);
            bg.addColorStop(1, window.bgGradient.stop100);
            ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

            orbs.forEach(o => {
                const dx = o.x - mouse.x, dy = o.y - mouse.y;
                const near = Math.sqrt(dx * dx + dy * dy) < 175;
                const tgt = near ? Math.min(o.opacity * 2.8, 0.22) : o.opacity;
                o._op += (tgt - o._op) * 0.05;
                const alpha = Math.round(o._op * 255).toString(16).padStart(2, '0');
                const g = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r);
                g.addColorStop(0, o.color + alpha); g.addColorStop(1, o.color + '00');
                ctx.beginPath(); ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2);
                ctx.fillStyle = g; ctx.fill();
                o.x += o.vx; o.y += o.vy;
                if (o.x < -o.r) o.x = W + o.r; if (o.x > W + o.r) o.x = -o.r;
                if (o.y < -o.r) o.y = H + o.r; if (o.y > H + o.r) o.y = -o.r;
            });

            rings.forEach(ring => {
                const pulse = Math.sin(tt * ring.speed * 1000 + ring.phase) * 11;
                const r = ring.r + pulse;
                const dx = ring.cx - mouse.x, dy = ring.cy - mouse.y;
                const near = Math.sqrt(dx * dx + dy * dy) < r + 55;
                
                ring._hov = ring._hov || 0;
                ring._hov += ((near ? 1 : 0) - ring._hov) * 0.1;

                ctx.beginPath(); ctx.arc(ring.cx, ring.cy, r, 0, Math.PI * 2);
                ctx.strokeStyle = ring.color; ctx.lineWidth = ring.thick;
                ctx.globalAlpha = ring.opacity;
                ctx.stroke(); 
                
                if (ring._hov > 0.01) {
                    ctx.save();
                    const hgrad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 200);
                    hgrad.addColorStop(0, `rgba(255, 255, 255, ${ring._hov * 0.65})`);
                    hgrad.addColorStop(1, `rgba(255, 255, 255, 0)`);
                    ctx.strokeStyle = hgrad;
                    ctx.lineWidth = ring.thick * (1 + ring._hov * 2.5);
                    ctx.globalAlpha = 1;
                    ctx.beginPath(); ctx.arc(ring.cx, ring.cy, r, 0, Math.PI * 2);
                    ctx.stroke();
                    ctx.restore();
                }
                ctx.globalAlpha = 1;
            });

            grains.forEach(g => {
                g.offset += g.speed;
                if (g.offset > W + H + 500) g.offset -= (W + H + 1000);
                if (g.offset < -(W + H + 500)) g.offset += (W + H + 1000);
                const sx = g.offset + 200, sy = -200, ex = g.offset - H - 200, ey = H + 200;
                const dx = ex - sx, dy = ey - sy, len = Math.sqrt(dx * dx + dy * dy);
                const tc = Math.max(0, Math.min(1, ((mouse.x - sx) * dx + (mouse.y - sy) * dy) / (len * len)));
                const dist = Math.sqrt((mouse.x - (sx + tc * dx)) ** 2 + (mouse.y - (sy + tc * dy)) ** 2);
                const hov = Math.max(0, 1 - dist / 85);
                g.hov += (hov - g.hov) * 0.1;
                
                ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey);
                ctx.lineWidth = g.thick;
                ctx.strokeStyle = g.color;
                ctx.globalAlpha = g.opacity;
                ctx.stroke(); 

                if (g.hov > 0.01) {
                    ctx.save();
                    const px = sx + tc * dx;
                    const py = sy + tc * dy;
                    const hgrad = ctx.createRadialGradient(px, py, 0, px, py, 180);
                    hgrad.addColorStop(0, `rgba(255, 255, 255, ${g.hov * 0.85})`);
                    hgrad.addColorStop(1, `rgba(255, 255, 255, 0)`);
                    
                    ctx.strokeStyle = hgrad;
                    ctx.lineWidth = g.thick * (1 + g.hov * 3);
                    ctx.globalAlpha = 1;
                    ctx.stroke();
                    ctx.restore();
                }
                ctx.globalAlpha = 1;
            });

            tt += 0.016;
            animId = requestAnimationFrame(drawBg);
        }

        window.addEventListener('resize', () => { cancelAnimationFrame(animId); resize(); });
        resize(); drawBg();

        // ══════════════════════════════════════════════════════
        //  DISC ROTATION
        // ══════════════════════════════════════════════════════
        let playing = false, angle = 0, progress = 0.346;
        const disc = document.getElementById('disc');
        const playIcon = document.getElementById('play-icon');
        const progFill = document.getElementById('progress-fill');
        const timeCur = document.getElementById('time-current');
        const TOTAL_SEC = 302;

        function fmtTime(s) {
            return Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0');
        }

        const spinInterval = setInterval(() => {
            if (!playing) return;
            angle = (angle + 0.55) % 360;
            disc.style.transform = `rotate(${angle}deg)`;
            progress = Math.min(progress + 0.00022, 1);
            progFill.style.width = (progress * 100) + '%';
            timeCur.textContent = fmtTime(progress * TOTAL_SEC);
        }, 16);

        document.getElementById('play-btn').addEventListener('click', () => {
            playing = !playing;
            disc.classList.toggle('playing', playing);
            document.getElementById('needle').style.transform = playing ? 'rotate(-38deg)' : 'rotate(-55deg)';
            if (!playing) flattenWaveform();
            playIcon.innerHTML = playing
                ? '<polygon points="5,3 13,8 5,13" fill="#F5EDD8"/>'
                : '<rect x="4" y="3" width="3" height="10" rx="1" fill="#F5EDD8"/><rect x="9" y="3" width="3" height="10" rx="1" fill="#F5EDD8"/>';
        });

        // Cover art helper — call this when Spotify/YouTube SDK provides artwork URL
        // e.g. setCoverArt('https://i.scdn.co/image/...')
        function setCoverArt(url) {
            const artEl = document.getElementById('disc-art');
            const labelEl = document.getElementById('disc-label');
            let img = artEl.querySelector('img');
            if (!img) { img = document.createElement('img'); artEl.appendChild(img); }
            img.onload = () => {
                img.classList.add('loaded');
                labelEl.classList.add('has-art');
            };
            img.onerror = () => img.classList.remove('loaded');
            img.src = url;
        }
        function clearCoverArt() {
            const img = document.querySelector('#disc-art img');
            const labelEl = document.getElementById('disc-label');
            if (img) { img.classList.remove('loaded'); setTimeout(() => img.remove(), 700); }
            labelEl.classList.remove('has-art');
        }

        // ══════════════════════════════════════════════════════
        //  WAVEFORM
        // ══════════════════════════════════════════════════════
        const waveformEl = document.getElementById('waveform');
        const wvBars = [];
        const wvPalette = [
            'rgba(200,168,122,', 'rgba(200,123,110,',
            'rgba(234,216,188,', 'rgba(140,90,58,',
        ];
        for (let i = 0; i < 46; i++) {
            const b = document.createElement('div');
            b.className = 'wv-bar'; b.style.height = '4px';
            waveformEl.appendChild(b); wvBars.push(b);
        }
        // Waveform: only animate while playing; truly freeze when paused
        let wvAnimating = true;
        function flattenWaveform() {
            wvBars.forEach(b => {
                b.style.height = '4px';
                b.style.background = 'rgba(200,168,122,0.1)';
                b.style.transition = 'height 0.3s, background 0.3s';
            });
        }
        function animateWaveform() {
            if (!playing) { flattenWaveform(); return; }
            wvBars.forEach((b, i) => {
                const h = 4 + Math.random() * 28;
                const ci = Math.floor(i / 12) % wvPalette.length;
                const op = h > 22 ? 0.7 : h > 12 ? 0.42 : 0.2;
                b.style.transition = 'height 0.1s, background 0.1s';
                b.style.height = h + 'px';
                b.style.background = wvPalette[ci] + op + ')';
            });
        }
        let wvInterval = setInterval(animateWaveform, 110);
        flattenWaveform(); // start flat — playing is false on load

        // ══════════════════════════════════════════════════════
        //  SEARCH & QUEUE DRAWERS
        // ══════════════════════════════════════════════════════
        const searchTrigger = document.getElementById('search-trigger');
        const searchDrawer = document.getElementById('search-drawer');
        const nextPill = document.getElementById('next-pill-nav');
        const queueDrawer = document.getElementById('queue-drawer');
        let searchOpen = false, queueOpen = false;

        searchTrigger.addEventListener('click', () => {
            searchOpen = !searchOpen;
            searchDrawer.classList.toggle('open', searchOpen);
            if (searchOpen) { queueOpen = false; queueDrawer.classList.remove('open'); }
        });
        if (nextPill) nextPill.addEventListener('click', () => {
            queueOpen = !queueOpen;
            queueDrawer.classList.toggle('open', queueOpen);
            if (queueOpen) { searchOpen = false; searchDrawer.classList.remove('open'); }
        });

        // Search tabs
        document.querySelectorAll('.stab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.stab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                if (tab.dataset.src === 'spotify') loadRecentSpotify();
            });
        });

        const searchInput = document.getElementById('search-input');
        const searchResults = document.getElementById('search-results');

        let searchDebounce;
        searchInput.addEventListener('input', () => {
            clearTimeout(searchDebounce);
            const query = searchInput.value.trim();
            if (!query) { loadRecentSpotify(); return; }
            searchDebounce = setTimeout(() => performSearch(query), 500);
        });

        async function loadRecentSpotify() {
            try {
                const res = await fetch('/api/spotify/recent');
                const tracks = await res.json();
                
                if (!res.ok) {
                   if (res.status === 401) {
                        searchResults.innerHTML = `
                            <div class="search-empty" style="padding:40px 20px;">
                                <p style="margin-bottom:15px; opacity:0.6;">Spotify session expired</p>
                                <button class="btn-glass btn-pill" onclick="linkSpotify()" style="border: 1px solid rgba(29,185,84,0.4); color:#1DB954;">reconnect spotify</button>
                            </div>`;
                   } else {
                        searchResults.innerHTML = `<div style="padding:20px; color:rgba(255,255,255,0.4); font-size:12px; text-align:center;">${tracks.error || 'Failed to load tracks'}</div>`;
                   }
                   return;
                }
                
                if (tracks && tracks.length > 0) {
                    renderTracks(tracks.map(i => i.track));
                } else {
                    searchResults.innerHTML = `<div class="search-empty">No recently played tracks found. Try searching!</div>`;
                }
            } catch (err) { 
                console.error(err); 
                searchResults.innerHTML = `<div class="search-empty">Failed to fetch recent tracks</div>`;
            }
        }

        async function performSearch(q) {
            try {
                const res = await fetch(`/api/spotify/search?q=${encodeURIComponent(q)}`);
                const tracks = await res.json();
                
                if (!res.ok) {
                    if (res.status === 401) {
                         searchResults.innerHTML = `
                             <div class="search-empty" style="padding:40px 20px;">
                                 <p style="margin-bottom:15px; opacity:0.6;">Spotify session expired</p>
                                 <button class="btn-glass btn-pill" onclick="linkSpotify()" style="border: 1px solid rgba(29,185,84,0.4); color:#1DB954;">reconnect spotify</button>
                             </div>`;
                    } else {
                         searchResults.innerHTML = `<div style="padding:20px; color:rgba(255,255,255,0.4); font-size:12px; text-align:center;">${tracks.error || 'Search failed'}</div>`;
                    }
                    return;
                }
                
                renderTracks(tracks);
            } catch (err) { 
                console.error(err);
                searchResults.innerHTML = `<div class="search-empty">Search error occurred</div>`;
            }
        }

        function renderTracks(tracks) {
            if (!tracks || tracks.length === 0) {
                searchResults.innerHTML = `<div style="padding:20px; color:rgba(255,255,255,0.4); font-size:12px; text-align:center;">No tracks found</div>`;
                return;
            }
            searchResults.innerHTML = tracks.map(t => `
                <div class="search-result" onclick="playSpotifyTrack('${t.uri}', '${t.name.replace(/'/g, "\\'")}', '${t.artists[0].name.replace(/'/g, "\\'")}', '${t.album.images[0]?.url}')">
                    <div class="sr-art" style="background-image:url('${t.album.images[1]?.url || t.album.images[0]?.url}'); background-size:cover;"></div>
                    <div>
                        <div class="sr-title">${t.name}</div>
                        <div class="sr-artist">${t.artists[0].name}</div>
                    </div>
                </div>
            `).join('');
        }

        // ══════════════════════════════════════════════════════
        //  SPOTIFY WEB SDK
        // ══════════════════════════════════════════════════════
        let spotifyPlayer = null;
        let spotifyDeviceId = null;
        let spotifyAccessToken = null;

        async function getSpotifyToken() {
            try {
                const res = await fetch('/auth/spotify/token');
                const data = await res.json();
                return data.access_token;
            } catch (err) {
                console.error('Failed to get Spotify token', err);
                return null;
            }
        }

        window.onSpotifyWebPlaybackSDKReady = async () => {
            spotifyAccessToken = await getSpotifyToken();
            if (!spotifyAccessToken) return;

            spotifyPlayer = new Spotify.Player({
                name: 'Melos Web Player',
                getOAuthToken: cb => { cb(spotifyAccessToken); },
                volume: 0.5
            });

            spotifyPlayer.addListener('ready', ({ device_id }) => {
                console.log('Ready with Device ID', device_id);
                spotifyDeviceId = device_id;
            });

            spotifyPlayer.addListener('not_ready', ({ device_id }) => {
                console.log('Device ID has gone offline', device_id);
            });

            spotifyPlayer.addListener('player_state_changed', state => {
                if (!state) return;
                updatePlaybackUI(state);
            });

            spotifyPlayer.connect();
        };

        function updatePlaybackUI(state) {
            const track = state.track_window.current_track;
            const isPaused = state.paused;
            
            // Update Title & Artist
            document.getElementById('track-title').textContent = track.name;
            document.getElementById('track-artist').textContent = track.artists.map(a => a.name).join(', ');
            
            // Update Disc Art
            const discArt = document.getElementById('disc-art');
            if (discArt && track.album.images[0]) {
                discArt.style.backgroundImage = `url('${track.album.images[0].url}')`;
                discArt.style.backgroundSize = 'cover';
            }

            // Sync visual playing state
            playing = !isPaused;
            const playBtn = document.getElementById('play-btn');
            const disc = document.getElementById('disc');
            
            if (playing) {
                playBtn.classList.add('playing');
                disc.classList.add('playing');
                document.getElementById('play-icon').innerHTML = '<rect x="4" y="3" width="3" height="10" fill="#F5EDD8"/><rect x="9" y="3" width="3" height="10" fill="#F5EDD8"/>';
                requestAnimationFrame(updateProgress);
            } else {
                playBtn.classList.remove('playing');
                disc.classList.remove('playing');
                document.getElementById('play-icon').innerHTML = '<polygon points="5,3 13,8 5,13" fill="#F5EDD8"/>';
            }

            // Update Progress
            duration = state.duration;
            currentTime = state.position;
            updateProgressDOM();
        }

        function updateProgressDOM() {
            const fill = document.getElementById('progress-fill');
            const currentLabel = document.getElementById('time-current');
            const totalLabel = document.querySelector('#progress-times span:last-child');

            const percent = (currentTime / duration) * 100;
            fill.style.width = percent + '%';
            
            currentLabel.textContent = formatTime(currentTime);
            totalLabel.textContent = formatTime(duration);
        }

        function formatTime(ms) {
            const totalSec = Math.floor(ms / 1000);
            const min = Math.floor(totalSec / 60);
            const sec = totalSec % 60;
            return `${min}:${sec < 10 ? '0' : ''}${sec}`;
        }

        let duration = 0;
        let currentTime = 0;
        function updateProgress() {
            if (!playing || !spotifyPlayer) return;
            currentTime += 1000;
            if (currentTime > duration) currentTime = duration;
            updateProgressDOM();
            setTimeout(() => { if (playing) requestAnimationFrame(updateProgress); }, 1000);
        }

        async function playSpotifyTrack(uri, title, artist, art) {
            try {
                const res = await fetch('/api/spotify/play', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ uri, device_id: spotifyDeviceId })
                });
                const data = await res.json();
                if (data.error) {
                    alert(data.error);
                }
            } catch (err) { console.error(err); }
        }

        function queueTrack(title, artist, art) {
            const qd = document.getElementById('queue-drawer');
            const item = document.createElement('div');
            item.className = 'queue-item';
            const artStyle = art ? `background-image:url('${art}'); background-size:cover;` : `background:linear-gradient(135deg,#C87B6E,#5A5248);`;
            item.innerHTML = `
                <div class="q-art" style="${artStyle}"></div>
                <div><div class="q-title">${title}</div><div class="q-artist">${artist}</div></div>
            `;
            qd.appendChild(item);
        }

        // Trigger recent tracks on first open
        searchTrigger.addEventListener('click', () => {
            if (searchDrawer.classList.contains('open')) {
                 loadRecentSpotify();
            }
        });

        // ══════════════════════════════════════════════════════
        //  CHAT
        // ══════════════════════════════════════════════════════
        const chatInput = document.getElementById('chat-input');
        const chatSend = document.getElementById('chat-send');
        const chatMessages = document.getElementById('chat-messages');

        function sendChatMessage() {
            const val = chatInput.value.trim(); if (!val) return;
            const msg = document.createElement('div'); msg.className = 'chat-msg';
            msg.innerHTML = `
    <span class="chat-user" style="color:rgba(245,237,216,0.5);">you</span>
    <div class="chat-bubble mine">${val}</div>
  `;
            chatMessages.appendChild(msg);
            chatInput.value = '';
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
        chatSend.addEventListener('click', sendChatMessage);
        chatInput.addEventListener('keydown', e => { if (e.key === 'Enter') sendChatMessage(); });

        // ══════════════════════════════════════════════════════
        //  AVATAR REACTIONS (ambient)
        // ══════════════════════════════════════════════════════
        // ── Hover reaction picker ──────────────────────────────────────────────────
        const avNodes = document.querySelectorAll('.av-node');
        const rxns = ['♥', '✦', '♪', '✿', '◈'];
        const emojiLabels = { '♥': 'hearts', '✦': 'sparkles', '♪': 'music notes', '✿': 'flowers', '◈': 'vibes' };

        // Ambient reactions (random, while playing)
        setInterval(() => {
            if (!playing) return;
            const av = avNodes[Math.floor(Math.random() * avNodes.length)];
            const rxn = rxns[Math.floor(Math.random() * rxns.length)];
            av.querySelector('.av-reaction').textContent = rxn;
            av.classList.add('reacting');
            setTimeout(() => av.classList.remove('reacting'), 1400);
        }, 3800);

        // Send reaction on hover-picker click
        document.querySelectorAll('.av-rxn-btn').forEach(btn => {
            btn.addEventListener('click', e => {
                e.stopPropagation();
                const avNode = btn.closest('.av-node');
                // Hide picker immediately after reaction sent
                const picker = avNode.querySelector('.av-reaction-picker');
                if (picker) {
                    picker.style.opacity = '0'; picker.style.pointerEvents = 'none';
                    setTimeout(() => { picker.style.opacity = ''; picker.style.pointerEvents = ''; }, 500);
                }
                const avId = avNode.dataset.av;
                const emoji = btn.dataset.emoji;
                const label = btn.dataset.label;
                const username = avNode.querySelector('.av-name').textContent;

                // 1. Flash reaction above their avatar
                const rxnSpan = avNode.querySelector('.av-reaction');
                rxnSpan.textContent = emoji;
                avNode.classList.add('reacting');
                setTimeout(() => avNode.classList.remove('reacting'), 1500);

                // 2. Show toast at bottom of their avatar
                const toast = document.getElementById('toast-' + avId);
                const toastEmoji = document.getElementById('toast-emoji-' + avId);
                const toastText = document.getElementById('toast-text-' + avId);
                toastEmoji.textContent = emoji;
                toastText.textContent = 'you sent ' + label + '!';
                toast.classList.add('show');
                setTimeout(() => toast.classList.remove('show'), 2800);

                // Show received-reaction notification in bottom centre (recipient's view)
                const notif = document.getElementById('received-reaction-notif');
                const notifText = document.getElementById('notif-text');
                const notifHearts = document.getElementById('notif-hearts');
                notifText.textContent = username + ' sent you ' + label + '!';
                notifHearts.innerHTML = [emoji, emoji, emoji].map(e =>
                    `<span style="font-size:18px;filter:drop-shadow(0 1px 2px rgba(0,0,0,0.5));">${e}</span>`
                ).join('');
                notif.classList.add('show');
                clearTimeout(notif._hideTimer);
                notif._hideTimer = setTimeout(() => notif.classList.remove('show'), 3500);

                // 3. Burst 4 floating hearts from that avatar toward centre
                const rect = avNode.getBoundingClientRect();
                const cx = rect.left + rect.width / 2;
                const cy = rect.top + rect.height / 2;
                for (let i = 0; i < 4; i++) {
                    const pop = document.createElement('div');
                    pop.className = 'heart-pop';
                    pop.style.left = (cx + (Math.random() - 0.5) * 28) + 'px';
                    pop.style.top = (cy + (Math.random() - 0.5) * 28) + 'px';
                    pop.style.animationDelay = (i * 0.08) + 's';
                    pop.textContent = emoji;
                    document.body.appendChild(pop);
                    setTimeout(() => pop.remove(), 900);
                }
            });
        });

        // ══════════════════════════════════════════════════════
        //  PANELS
        // ══════════════════════════════════════════════════════
        function openPanel(id) {
            document.getElementById(id).classList.add('open');
        }
        function closePanel(id) {
            document.getElementById(id).classList.remove('open');
        }
        // Close on overlay click
        document.querySelectorAll('.panel-overlay').forEach(overlay => {
            overlay.addEventListener('click', e => {
                if (e.target === overlay) overlay.classList.remove('open');
            });
        });

        // ══════════════════════════════════════════════════════
        //  CARD BUILDER
        // ══════════════════════════════════════════════════════
        const cardDesigns = [
            { name: 'Midnight Record', bg: 'linear-gradient(135deg,#1A0E06,#C87B6E)' },
            { name: 'Garden Radio', bg: 'linear-gradient(135deg,#2C1A0A,#C8A87A)' },
            { name: 'Cassette Crush', bg: 'linear-gradient(135deg,#C87B6E,#8C5A3A)' },
            { name: 'Stargazer', bg: 'linear-gradient(135deg,#1E1208,#5A5248)' },
            { name: 'Coffee & Vinyl', bg: 'linear-gradient(135deg,#8C5A3A,#C8A87A)' },
            { name: 'Neon Dusk', bg: 'linear-gradient(135deg,#2C1A0A,#DFA090)' },
            { name: 'Pressed Flowers', bg: 'linear-gradient(135deg,#C87B6E,#EAD8BC)' },
            { name: 'The Note', bg: 'linear-gradient(135deg,#EAD8BC,#8C5A3A)' },
        ];
        const cardGrid = document.getElementById('card-grid');
        let selectedCard = 0;

        cardDesigns.forEach((cd, i) => {
            const el = document.createElement('div');
            el.style.cssText = `
    aspect-ratio:2/3;border-radius:10px;cursor:pointer;
    background:${cd.bg};
    border:2px solid ${i === 0 ? 'rgba(223,160,144,0.6)' : 'rgba(200,168,122,0.1)'};
    transition:transform 0.18s,border-color 0.18s;
    display:flex;align-items:flex-end;padding:6px;
  `;
            el.innerHTML = `<span style="font-family:var(--font-mono);font-size:7px;color:rgba(245,237,216,0.55);letter-spacing:1px;">${cd.name}</span>`;
            el.addEventListener('click', () => {
                selectedCard = i;
                document.querySelectorAll('#card-grid > div').forEach((c, ci) => {
                    c.style.borderColor = ci === i ? 'rgba(223,160,144,0.6)' : 'rgba(200,168,122,0.1)';
                });
            });
            cardGrid.appendChild(el);
        });

        function sendCard() {
            const msg = document.getElementById('card-message').value.trim();
            const from = document.getElementById('card-from').value.trim() || 'a friend';
            if (!msg) { alert('Write a message first.'); return; }
            closePanel('card-panel');
            const env = document.createElement('div');
            env.style.cssText = `
    position:fixed;font-size:28px;pointer-events:none;z-index:9000;
    left:45%;top:65%;
    transition:transform 2.8s cubic-bezier(0.1,0,0.8,1),opacity 2.8s;opacity:1;
  `;
            env.textContent = '✉️';
            document.body.appendChild(env);
            setTimeout(() => { env.style.transform = 'translateY(-55vh) translateX(20vw) rotate(8deg)'; env.style.opacity = '0'; }, 50);
            setTimeout(() => env.remove(), 3000);
            document.getElementById('card-message').value = '';
        }


        // ══════════════════════════════════════════════════════
        //  BOUQUET SYSTEM — real images
        // ══════════════════════════════════════════════════════
        // BOUQUET_IMGS and FLOWERS are initialised after MELOS_ASSETS loads
        let BOUQUET_IMGS = {};
        const FLOWERS = [
            { id: 1, name: 'Lavender', key: 'flower1_lavender' },
            { id: 2, name: 'Sunflower', key: 'flower2_sunflower' },
            { id: 3, name: 'Carnation', key: 'flower3_carnation' },
            { id: 4, name: 'Dahlia', key: 'flower4_dahlia' },
            { id: 5, name: 'Cosmos', key: 'flower5_cosmos' },
            { id: 6, name: "Baby's Breath", key: 'flower6_babysbreath' },
            { id: 7, name: 'Red Rose', key: 'flower7_rose' },
            { id: 8, name: 'Tulip', key: 'flower8_tulip' },
        ];

        let selectedBouquetId = null;
        let pickedFlowers = []; // array of flower ids (max 6, duplicates allowed)

        // Set bouquet images on load
        document.addEventListener('DOMContentLoaded', () => {
            // MELOS_ASSETS is guaranteed to exist now (defined before this script)
            BOUQUET_IMGS = {
                1: MELOS_ASSETS.bouquet1,
                2: MELOS_ASSETS.bouquet2,
                3: MELOS_ASSETS.bouquet3,
            };
            document.getElementById('wrap-img-1').src = MELOS_ASSETS.bouquet1;
            document.getElementById('wrap-img-2').src = MELOS_ASSETS.bouquet2;
            document.getElementById('wrap-img-3').src = MELOS_ASSETS.bouquet3;
            buildFlowerPickerGrid();
        });

        function selectBouquet(id) {
            selectedBouquetId = id;
            document.querySelectorAll('.bouquet-wrap-choice').forEach(el => {
                el.classList.toggle('selected', parseInt(el.dataset.bouquet) === id);
            });
            // Brief pause then go to step 2
            setTimeout(() => {
                document.getElementById('bouquet-step1').style.display = 'none';
                document.getElementById('bouquet-step2').style.display = 'block';
                document.getElementById('preview-bouquet-img').src = BOUQUET_IMGS[id];
                renderBouquetPreview();
            }, 220);
        }

        function goBackToBouquetStep1() {
            document.getElementById('bouquet-step1').style.display = 'block';
            document.getElementById('bouquet-step2').style.display = 'none';
            pickedFlowers = [];
            renderBouquetPreview();
        }

        function buildFlowerPickerGrid() {
            const grid = document.getElementById('flower-picker-grid');
            if (!grid) return;
            grid.innerHTML = '';
            FLOWERS.forEach(f => {
                const tile = document.createElement('div');
                tile.className = 'flower-pick-tile';
                tile.dataset.fid = f.id;
                tile.innerHTML = `
      <img src="${MELOS_ASSETS[f.key]}" alt="${f.name}" loading="lazy"/>
      <span class="flower-tile-name">${f.name}</span>
      <div class="sel-badge" id="sbadge-${f.id}">✓</div>
    `;
                tile.addEventListener('click', () => toggleFlower(f.id, tile));
                grid.appendChild(tile);
            });
        }

        function toggleFlower(fid, tileEl) {
            const count = pickedFlowers.filter(id => id === fid).length;
            if (count >= 10) return;
            
            pickedFlowers.push(fid);
            tileEl.classList.add('selected');
            
            // update badge
            const badge = document.getElementById('sbadge-' + fid);
            if (badge) {
                const newCount = count + 1;
                badge.innerText = newCount;
                badge.style.display = 'flex';
            }
            
            renderBouquetPreview();
        }

        function resetBouquet() {
            pickedFlowers = [];
            document.querySelectorAll('.flower-pick-tile').forEach(el => el.classList.remove('selected'));
            document.querySelectorAll('.sel-badge').forEach(el => { el.innerText = '✓'; el.style.display = '';});
            renderBouquetPreview();
        }

        function renderBouquetPreview() {
            const layer = document.getElementById('preview-flowers-layer');
            layer.innerHTML = '';
            if (!pickedFlowers.length) return;

            const count = pickedFlowers.length;
            // Arrange flowers in a fan — stems converge at bottom centre
            // Each flower is an img absolutely positioned
            // spread angle: -30deg to +30deg across the count
            const containerW = layer.offsetWidth || 152;
            const containerH = layer.offsetHeight || 135;

            pickedFlowers.forEach((fid, i) => {
                const flower = FLOWERS.find(f => f.id === fid);
                if (!flower) return;

                const total = count;
                const t = total === 1 ? 0 : (i / (total - 1)) * 2 - 1; // -1..1
                const angle = t * 15; // gentle fan, max ±15deg
                const xOffset = t * (containerW * 0.15); // horizontal spread

                // Flower size: comfortably visible
                const sz = count <= 3 ? 70 : count <= 6 ? 60 : 45;
                // Height: closely arranged
                const stemH = Math.round(containerH * 0.85);

                const stem = document.createElement('div');
                stem.className = 'preview-flower-stem';
                stem.style.cssText = `
      width:${sz}px;
      height:${stemH}px;
      left:calc(50% + ${xOffset}px - ${sz / 2}px);
      transform:rotate(${angle}deg);
      transform-origin:bottom center;
      position:absolute;
      bottom:-10px;
      z-index:3;
    `;
                const img = document.createElement('img');
                img.src = MELOS_ASSETS[flower.key];
                img.alt = flower.name;
                img.style.cssText = 'width:100%;height:100%;object-fit:contain;object-position:top center;';
                stem.appendChild(img);
                layer.appendChild(stem);
            });
        }

        function sendRealBouquet() {
            let slider = document.getElementById('bouquet-slider');
            if (slider) slider.value = 0;
            if (!selectedBouquetId) { return; }
            if (!pickedFlowers.length) { return; }

            closePanel('bouquet-panel');

            // Fly the bouquet preview image across the screen
            const previewImg = document.getElementById('preview-bouquet-img');
            const rect = previewImg.getBoundingClientRect();

            const flyEl = document.createElement('div');
            flyEl.style.cssText = `
    position:fixed;z-index:9999;pointer-events:none;
    left:${rect.left}px;top:${rect.top}px;
    width:${rect.width}px;height:${rect.height}px;
    transition:transform 2.2s cubic-bezier(0.2,0,0.6,1),opacity 2s;
    opacity:1;
  `;
            // Stack bouquet + flowers in the fly element
            const bImg = document.createElement('img');
            bImg.src = BOUQUET_IMGS[selectedBouquetId];
            bImg.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:contain;';
            flyEl.appendChild(bImg);
            document.body.appendChild(flyEl);

            setTimeout(() => {
                flyEl.style.transform = 'translate(60vw,-40vh) scale(0.4) rotate(12deg)';
                flyEl.style.opacity = '0';
            }, 60);
            setTimeout(() => flyEl.remove(), 2500);

            // Reset
            pickedFlowers = [];
            selectedBouquetId = null;
            document.querySelectorAll('.flower-pick-tile').forEach(el => el.classList.remove('selected'));
            document.querySelectorAll('.sel-badge').forEach(el => { el.innerText = '✓'; el.style.display = '';});
            document.querySelectorAll('.bouquet-wrap-choice').forEach(el => el.classList.remove('selected'));
            document.getElementById('bouquet-step1').style.display = 'block';
            document.getElementById('bouquet-step2').style.display = 'none';
        }


        let userHasSpotify = false;

        let currentUser = null;

        async function initRoomAuth() {
            try {
                const res = await fetch('/auth/me');
                if (res.ok) {
                    const data = await res.json();
                    currentUser = data;
                    userHasSpotify = data.has_spotify;
                    
                    if (userHasSpotify) {
                        const sBtn = document.getElementById('spotify-btn');
                        if (sBtn) {
                            sBtn.title = "Linked to Spotify";
                            sBtn.style.boxShadow = "0 0 15px rgba(29, 185, 84, 0.4)";
                            sBtn.style.borderColor = "rgba(29, 185, 84, 0.6)";
                        }
                    }

                    // Update UI with real user info
                    updateListenersUI();
                    updateNavUserInfo();

                    // Prompt for username if it looks like an email or is missing
                    if (!currentUser.username || currentUser.username.includes('@')) {
                        setTimeout(() => openPanel('profile-panel'), 1500);
                    }
                } else {
                    // Not authenticated — show guest UI or redirect
                    console.warn('User not authenticated');
                    const spotifyBtn = document.getElementById('spotify-btn');
                    if (spotifyBtn) spotifyBtn.onclick = () => window.location.href = '/login.html';
                    
                    // Show a message in the room that they are a guest
                    const countDisplay = document.getElementById('listener-count');
                    if (countDisplay) countDisplay.textContent = '· Guest Mode';
                }
            } catch (err) {
                console.error('Auth check failed', err);
            }
        }

        async function updateUsername() {
            const btn = document.getElementById('save-profile-btn');
            const input = document.getElementById('profile-name-input');
            const val = input.value.trim();
            if (val.length < 2) return alert('Name too short');
            
            btn.disabled = true;
            btn.textContent = 'saving...';
            
            try {
                const res = await fetch('/auth/update-username', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: val })
                });
                if (res.ok) {
                    currentUser.username = val;
                    updateListenersUI();
                    updateNavUserInfo();
                    closePanel('profile-panel');
                    btn.textContent = 'saved!';
                    setTimeout(() => { btn.disabled = false; btn.textContent = 'save changes'; }, 1000);
                } else {
                    const data = await res.json();
                    alert(data.error || 'Failed to update name');
                    btn.disabled = false;
                    btn.textContent = 'save changes';
                }
            } catch (err) {
                console.error(err);
                btn.disabled = false;
                btn.textContent = 'save changes';
            }
        }

        function updateNavUserInfo() {
            if (!currentUser) return;
            const navAv = document.querySelector('.nav-avatar');
            if (navAv) {
                navAv.textContent = (currentUser.username || currentUser.email || 'A')[0].toUpperCase();
            }
        }

        function updateListenersUI() {
            const container = document.getElementById('listeners-container');
            const countDisplay = document.getElementById('listener-count');
            if (!container) return;
            
            // Only show me for now
            if (!currentUser) {
                container.innerHTML = '';
                if (countDisplay) countDisplay.textContent = '· 0 listening';
                return;
            }

            if (countDisplay) countDisplay.textContent = '· 1 listening';

            const initial = (currentUser.username || currentUser.email || 'A')[0].toUpperCase();
            const name = currentUser.username || 'you';
            
            container.innerHTML = `
                <div class="av-node" style="top:25%; left:38%; pointer-events: all;" data-av="me">
                    <div class="av-circle" style="width:60px;height:60px;background:rgba(200,123,110,0.3);box-shadow: 0 0 25px rgba(200,123,110,0.3); border: 2px solid rgba(200, 168, 122, 0.4);">
                        ${initial}<div class="av-online"></div>
                    </div>
                    <span class="av-name">${name}</span>
                    <span class="av-reaction">♥</span>
                    <div class="av-reaction-picker">
                        <button class="av-rxn-btn" data-emoji="♥" data-label="hearts">♥</button>
                        <button class="av-rxn-btn" data-emoji="✦" data-label="sparkles">✦</button>
                        <button class="av-rxn-btn" data-emoji="♪" data-label="music notes">♪</button>
                        <button class="av-rxn-btn" data-emoji="✿" data-label="flowers">✿</button>
                        <button class="av-rxn-btn" data-emoji="◈" data-label="vibes">◈</button>
                    </div>
                    <div class="rx-toast" id="toast-me">
                        <span class="rx-toast-emoji" id="toast-emoji-me">♥</span>
                        <span class="rx-toast-text" id="toast-text-me">you sent hearts!</span>
                    </div>
                </div>
            `;
            
            // Re-bind reaction buttons
            bindReactionButtons();
        }

        function bindReactionButtons() {
            document.querySelectorAll('.av-rxn-btn').forEach(btn => {
                // Remove existing if any (simplification)
                btn.replaceWith(btn.cloneNode(true));
            });
            
            // Re-fetch all and bind
            document.querySelectorAll('.av-rxn-btn').forEach(btn => {
                btn.addEventListener('click', e => {
                    e.stopPropagation();
                    const avNode = btn.closest('.av-node');
                    const picker = avNode.querySelector('.av-reaction-picker');
                    if (picker) {
                        picker.style.opacity = '0'; picker.style.pointerEvents = 'none';
                        setTimeout(() => { picker.style.opacity = ''; picker.style.pointerEvents = ''; }, 500);
                    }
                    const avId = avNode.dataset.av;
                    const emoji = btn.dataset.emoji;
                    const label = btn.dataset.label;
                    const username = avNode.querySelector('.av-name').textContent;

                    const rxnSpan = avNode.querySelector('.av-reaction');
                    rxnSpan.textContent = emoji;
                    avNode.classList.add('reacting');
                    setTimeout(() => avNode.classList.remove('reacting'), 1500);

                    const toast = document.getElementById('toast-' + avId);
                    const toastEmoji = document.getElementById('toast-emoji-' + avId);
                    const toastText = document.getElementById('toast-text-' + avId);
                    toastEmoji.textContent = emoji;
                    toastText.textContent = 'you sent ' + label + '!';
                    toast.classList.add('show');
                    setTimeout(() => toast.classList.remove('show'), 2800);

                    const notif = document.getElementById('received-reaction-notif');
                    const notifText = document.getElementById('notif-text');
                    const notifHearts = document.getElementById('notif-hearts');
                    notifText.textContent = username + ' sent you ' + label + '!';
                    notifHearts.innerHTML = [emoji, emoji, emoji].map(e =>
                        `<span style="font-size:18px;filter:drop-shadow(0 1px 2px rgba(0,0,0,0.5));">${e}</span>`
                    ).join('');
                    notif.classList.add('show');
                    clearTimeout(notif._hideTimer);
                    notif._hideTimer = setTimeout(() => notif.classList.remove('show'), 3500);

                    const rect = avNode.getBoundingClientRect();
                    const cx = rect.left + rect.width / 2;
                    const cy = rect.top + rect.height / 2;
                    for (let i = 0; i < 4; i++) {
                        const pop = document.createElement('div');
                        pop.className = 'heart-pop';
                        pop.style.left = (cx + (Math.random() - 0.5) * 28) + 'px';
                        pop.style.top = (cy + (Math.random() - 0.5) * 28) + 'px';
                        pop.style.animationDelay = (i * 0.08) + 's';
                        pop.textContent = emoji;
                        document.body.appendChild(pop);
                        setTimeout(() => pop.remove(), 900);
                    }
                });
            });
        }

        function linkSpotify() {
            if (userHasSpotify) {
                // If already linked, show notification
                const toast = document.getElementById('toast-av1');
                if (toast) {
                    document.getElementById('toast-text-av1').innerText = "Already linked to Spotify!";
                    toast.classList.add('visible');
                    setTimeout(() => toast.classList.remove('visible'), 2000);
                }
                return;
            }
            // Pass the current room URL as a query parameter
            const returnTo = encodeURIComponent(window.location.href);
            window.location.href = '/auth/spotify?returnTo=' + returnTo;
        }

        function linkYouTubeMusic() {
            // Placeholder: currently we track only Spotify
            if (userHasSpotify) return; 
            window.location.href = '/auth/spotify'; 
        }

        // Initialize on load
        window.addEventListener('load', () => {
            initRoomAuth();
            
            // Automatically open search drawer as requested
            setTimeout(() => {
                if (!searchOpen) {
                    searchTrigger.click();
                }
            }, 800);
        });

        // ══════════════════════════════════════════════════════
        //  HOST DROPDOWN
        // ══════════════════════════════════════════════════════
        const ROOM_LISTENERS = [
            { initials: 'MJ', name: 'maya_j', color: 'rgba(200,123,110,0.45)' },
            { initials: 'AR', name: 'arjun_k', color: 'rgba(90,82,72,0.45)' },
            { initials: 'SL', name: 'sol_w', color: 'rgba(140,90,58,0.45)' },
            { initials: 'PN', name: 'priya_n', color: 'rgba(200,123,110,0.38)' },
            { initials: 'KW', name: 'kw', color: 'rgba(90,82,72,0.38)' },
        ];

        function buildHostMenu() {
            const el = document.getElementById('host-menu-listeners');
            if (!el) return;
            el.innerHTML = ROOM_LISTENERS.map(l => `
    <div style="display:flex;align-items:center;gap:8px;padding:6px 14px;">
      <div style="width:24px;height:24px;border-radius:50%;background:${l.color};display:flex;align-items:center;justify-content:center;font-size:9px;color:#F5EDD8;flex-shrink:0;">${l.initials}</div>
      <span style="font-size:12px;font-weight:300;color:rgba(245,237,216,0.75);">${l.name}</span>
    </div>
  `).join('');
        }

        function toggleHostMenu() {
            const menu = document.getElementById('host-menu');
            if (!menu) return;
            const open = menu.style.display === 'block';
            menu.style.display = open ? 'none' : 'block';
            if (!open) buildHostMenu();
        }
        // Close host menu on outside click
        document.addEventListener('click', e => {
            const menu = document.getElementById('host-menu');
            const btn = document.getElementById('host-btn');
            if (menu && btn && !menu.contains(e.target) && !btn.contains(e.target)) {
                menu.style.display = 'none';
            }
        });

        // ══════════════════════════════════════════════════════
        //  KEYBOARD SHORTCUTS
        // ══════════════════════════════════════════════════════
        document.addEventListener('keydown', e => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            if (e.code === 'Space') { e.preventDefault(); document.getElementById('play-btn').click(); }
            if (e.key === 'Escape') {
                document.querySelectorAll('.panel-overlay.open').forEach(p => p.classList.remove('open'));
                searchDrawer.classList.remove('open'); searchOpen = false;
                queueDrawer.classList.remove('open'); queueOpen = false;
            }
        });
    