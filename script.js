(() => {
    const PASSWORD_SECRET = "snidissa5";
    const CONFETTI_COLORS = [
        "#d35400",
        "#f39c12",
        "#8e2c2c",
        "#faf3e0",
        "#7f6858",
        "#7b4b94",
        "#ffea00"
    ];
    const SONG_SOURCES = {
        mode1: "audio/birthday_song_1.mp3",
        mode2: "audio/birthday_song_2.mp3"
    };
    const reduceMotionQuery = window.matchMedia
        ? window.matchMedia("(prefers-reduced-motion: reduce)")
        : { matches: false };

    // Parse tempo labels for singing cats
    const TEMPO_LABELS = `3.889342	3.889342	enter
4.500000	4.500000	
4.833333	4.833333	
5.041667	5.041667	
5.500000	5.500000	
6.000000	6.000000	
6.541667	6.541667	
7.041667	7.041667	
7.541667	7.541667	
8.173424	8.173424	exit
12.132426	12.132426	enter
12.791667	12.791667	
13.083333	13.083333	
13.291667	13.291667	
13.750000	13.750000	
14.250000	14.250000	
14.791667	14.791667	
15.291667	15.291667	
15.750000	15.750000	
16.416667	16.416667	exit
20.770249	20.770249	enter
21.500000	21.500000	
22.166667	22.166667	
22.375000	22.375000	
22.875000	22.875000	
23.375000	23.375000	
23.833333	23.833333	
24.291667	24.291667	
25.041667	25.041667	exit
29.408073	29.408073	enter
30.166667	30.166667	
30.500000	30.500000	
31.125000	31.125000	
31.666667	31.666667	
32.166667	32.166667	
32.708333	32.708333	
33.208333	33.208333	
34.041667	34.041667	exit`;

    function parseTempoLabels(text) {
        const lines = text.trim().split('\n');
        const events = [];

        lines.forEach(line => {
            const parts = line.trim().split('\t');
            if (parts.length >= 2) {
                const time = parseFloat(parts[0]);
                const label = parts[2] || 'sing';
                events.push({ time, label });
            }
        });

        return events;
    }

    const TEMPO_EVENTS = parseTempoLabels(TEMPO_LABELS);

    document.addEventListener("DOMContentLoaded", () => {
        const page = document.body?.dataset?.page;
        if (page === "landing") {
            initLandingPage();
        }
        if (page === "gift") {
            initGiftPage();
        }
    });

    function initLandingPage() {
        const form = document.getElementById("claim-form");
        const passwordInput = document.getElementById("password-input");
        const claimButton = document.getElementById("claim-button");
        const feedback = document.getElementById("form-feedback");
        const progressStatus = document.getElementById("progress-status");
        const overlay = document.getElementById("audio-permission");
        const overlayButton = document.getElementById("audio-play-button");
        const faces = Array.from(document.querySelectorAll(".face"));
        const facesStage = document.querySelector(".faces-stage");
        const facesOrbit = document.querySelector(".faces-orbit");
        const sparkleOverlay = document.getElementById("sparkle-overlay");
        const starburst = document.getElementById("starburst");
        const raveOverlay = document.querySelector(".rave-overlay");
        const birthdayAudio = document.getElementById("birthday-audio");
        const clapAudio = document.getElementById("clap-audio");
        const singingCats = Array.from(document.querySelectorAll(".singing-cat"));
        const modeInputs = Array.from(document.querySelectorAll('input[name="party-mode"]'));
        const modeFeedback = document.getElementById("mode-feedback");
        const singingCatsContainer = document.querySelector(".singing-cats");

        if (!form || !passwordInput || !claimButton) {
            return;
        }

        let celebrationStarted = false;
        let redirectScheduled = false;
        let listenersAttached = false;
        let catsAnimationFrame = null;

        const normalizedPassword = PASSWORD_SECRET.trim().toLowerCase();

        // Check if coming from replay - pre-fill password and select mode
        try {
            const storedPassword = sessionStorage.getItem('birthday_password');
            const storedMode = sessionStorage.getItem('party_mode');

            if (storedPassword) {
                passwordInput.value = storedPassword;
                passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
            }

            if (storedMode) {
                const modeInput = modeInputs.find(input => input.value === storedMode);
                if (modeInput) {
                    modeInput.checked = true;
                    modeInput.dispatchEvent(new Event('change', { bubbles: true }));
                }
            }
        } catch (e) {
            // Ignore if sessionStorage is not available
        }

        const updateFeedback = (text = "", type) => {
            if (!feedback) {
                return;
            }
            feedback.textContent = text;
            feedback.classList.remove("success", "error");
            if (type) {
                feedback.classList.add(type);
            }
        };

        const updateProgress = (text = "") => {
            if (progressStatus) {
                progressStatus.textContent = text;
            }
        };

        const getSelectedMode = () => {
            return modeInputs.find((input) => input.checked)?.value || null;
        };

        const updateClaimButtonState = () => {
            const entered = passwordInput.value.trim();
            const matches = entered.toLowerCase() === normalizedPassword && entered.length > 0;
            const modeSelected = !!getSelectedMode();
            claimButton.disabled = !(matches && modeSelected);

            if (!modeSelected && matches) {
                if (modeFeedback) {
                    modeFeedback.textContent = "Pick a party mode to continue.";
                }
            } else if (modeFeedback) {
                modeFeedback.textContent = "";
            }

            return { matches, modeSelected };
        };

        passwordInput.addEventListener("input", () => {
            const entered = passwordInput.value.trim();
            const matches = entered.toLowerCase() === normalizedPassword && entered.length > 0;
            if (matches) {
                updateFeedback("Password accepted! Hit the button to party.", "success");
            } else if (entered.length) {
                updateFeedback("Almost! Try a different secret word.", "error");
            } else {
                updateFeedback();
            }

            updateClaimButtonState();
        });

        form.addEventListener("submit", (event) => {
            event.preventDefault();
            const { matches, modeSelected } = updateClaimButtonState();
            if (claimButton.disabled) {
                if (matches && !modeSelected) {
                    if (modeFeedback) {
                        modeFeedback.textContent = "Pick a party mode to continue.";
                    }
                    return;
                }
                updateFeedback("No peeking without the password!", "error");
                return;
            }
            if (!modeSelected) {
                if (modeFeedback) {
                    modeFeedback.textContent = "Pick a party mode to continue.";
                }
                return;
            }
            startCelebration();
        });

        modeInputs.forEach((input) => {
            input.addEventListener("change", () => {
                selectedMode = getSelectedMode();
                if (selectedMode && modeFeedback) {
                    modeFeedback.textContent = "";
                }
                const message =
                    selectedMode === "mode1"
                        ? "Option 1 armed!"
                        : selectedMode === "mode2"
                            ? "Option 2 ready!"
                            : "";
                updateProgress(message);
                updateClaimButtonState();
            });
        });

        if (overlayButton) {
            overlayButton.addEventListener("click", () => {
                overlay?.classList.add("is-hidden");
                startAudioPlayback();
            });
        }

        updateClaimButtonState();

        function startCelebration() {
            if (celebrationStarted) {
                return;
            }
            celebrationStarted = true;

            selectedMode = getSelectedMode() || "mode2";
            catsShouldSing = selectedMode === "mode2";

            claimButton.disabled = true;
            passwordInput.disabled = true;
            form.classList.add("form-dismissed");
            form.setAttribute("aria-hidden", "true");
            facesStage?.classList.add("is-active");
            facesStage?.setAttribute("aria-hidden", "false");
            updateFeedback();

            updateProgress(
                selectedMode === "mode1"
                    ? "Cue the turbo rave... brace for maximum glow!"
                    : "Cue the goofy faces, glowing lights, and singing cats!"
            );

            if (birthdayAudio) {
                try {
                    birthdayAudio.pause();
                } catch (e) {
                    /* noop */
                }
                const source = SONG_SOURCES[selectedMode] || SONG_SOURCES.mode2;
                birthdayAudio.src = source;
                birthdayAudio.load();
            }

            if (singingCatsContainer) {
                singingCatsContainer.classList.toggle("is-disabled", !catsShouldSing);
            }

            fireConfettiBurst({ origin: { x: 0.5, y: 0.8 } });
            startConfettiLoop();
            if (!prefersReducedMotion()) {
                sparkleOverlay?.classList.add("is-active");
            }
            activateRaveOverlay(raveOverlay, { intense: selectedMode === "mode1" });

            if (faces.length) {
                animateFaces(faces, facesOrbit);
            }

            if (!catsShouldSing) {
                stopSingingCats();
                hideCats();
            }

            startAudioPlayback();
        }

        function startAudioPlayback() {
            if (!birthdayAudio) {
                scheduleRedirect(2400);
                return;
            }

            if (!listenersAttached) {
                attachAudioListeners();
                listenersAttached = true;
            }

            try {
                birthdayAudio.currentTime = 0;
                birthdayAudio.volume = 1;
            } catch (e) {
                /* noop */
            }

            const playPromise = birthdayAudio.play();

            if (playPromise && typeof playPromise.then === "function") {
                playPromise
                    .then(() => {
                        overlay?.classList.add("is-hidden");
                        updateProgress("🎵 Birthday serenade in progress...");
                        if (catsShouldSing) {
                            startSingingCats();
                        } else {
                            hideCats();
                        }
                    })
                    .catch(() => {
                        overlay?.classList.remove("is-hidden");
                        updateProgress("Tap to let the music play!");
                    });
            } else {
                updateProgress("🎵 Birthday serenade in progress...");
                if (catsShouldSing) {
                    startSingingCats();
                } else {
                    hideCats();
                }
            }
        }

        function attachAudioListeners() {
            if (!birthdayAudio) {
                return;
            }

            const onSongEnded = () => {
                stopSingingCats();
                updateProgress("👏 Applause break coming right up...");
                if (!clapAudio) {
                    scheduleRedirect(1800);
                    return;
                }
                try {
                    clapAudio.currentTime = 0;
                } catch (e) {
                    /* noop */
                }
                const clapPlay = clapAudio.play();
                if (clapPlay && typeof clapPlay.then === "function") {
                    clapPlay.catch(() => {
                        scheduleRedirect(1400);
                    });
                }
            };

            const onSongError = () => {
                stopSingingCats();
                updateProgress("We lost the tune, heading to your present instead...");
                scheduleRedirect(1500);
            };

            const onClapEnded = () => {
                updateProgress("🎁 Marching you to the gift...");
                scheduleRedirect(900);
            };

            const onClapError = () => {
                scheduleRedirect(900);
            };

            birthdayAudio.addEventListener("ended", onSongEnded, { once: true });
            birthdayAudio.addEventListener("error", onSongError, { once: true });

            if (clapAudio) {
                clapAudio.addEventListener("ended", onClapEnded, { once: true });
                clapAudio.addEventListener("error", onClapError, { once: true });
            }
        }

        function scheduleRedirect(delay = 800) {
            if (redirectScheduled) {
                return;
            }
            redirectScheduled = true;

            // Store password and mode in sessionStorage for replay functionality
            try {
                sessionStorage.setItem('birthday_password', passwordInput.value.trim());
                sessionStorage.setItem('party_mode', selectedMode || 'mode2');
            } catch (e) {
                // Ignore if sessionStorage is not available
            }

            setTimeout(() => {
                window.location.href = "gift.html";
            }, delay);
        }

        function startSingingCats() {
            if (prefersReducedMotion() || !singingCats.length || !birthdayAudio) {
                return;
            }

            let currentEventIndex = 0;
            let catsVisible = false;

            const syncCats = () => {
                const currentTime = birthdayAudio.currentTime + 0.2; // Shift timeline by 0.2s

                while (currentEventIndex < TEMPO_EVENTS.length &&
                    TEMPO_EVENTS[currentEventIndex].time <= currentTime) {

                    const event = TEMPO_EVENTS[currentEventIndex];

                    if (event.label === 'enter') {
                        showCats();
                        catsVisible = true;
                    } else if (event.label === 'exit') {
                        hideCats();
                        catsVisible = false;
                    } else if (event.label === 'sing' && catsVisible) {
                        triggerCatsSing();
                    }

                    currentEventIndex++;
                }

                if (!birthdayAudio.paused && !birthdayAudio.ended) {
                    catsAnimationFrame = requestAnimationFrame(syncCats);
                }
            };

            catsAnimationFrame = requestAnimationFrame(syncCats);
        }

        function stopSingingCats() {
            if (catsAnimationFrame) {
                cancelAnimationFrame(catsAnimationFrame);
                catsAnimationFrame = null;
            }
            hideCats();
        }

        function showCats() {
            if (!window.gsap) {
                return;
            }

            singingCats.forEach(cat => {
                gsap.to(cat, {
                    x: 0,
                    duration: 0.3,
                    ease: "power2.out"
                });
            });
        }

        function hideCats() {
            if (!window.gsap) {
                return;
            }

            singingCats.forEach(cat => {
                const isLeft = cat.classList.contains('singing-cat--left');

                gsap.to(cat, {
                    x: isLeft ? -84 : 84,
                    duration: 0.25,
                    ease: "power2.in",
                    onComplete: () => {
                        cat.classList.remove('is-singing');
                    }
                });
            });
        }

        function triggerCatsSing() {
            singingCats.forEach(cat => {
                // First remove is-singing to show closed mouth (frame 1)
                cat.classList.remove('is-singing');

                // After 100ms, add is-singing to show open mouth (frame 2)
                // and keep it until the next timestamp
                setTimeout(() => {
                    cat.classList.add('is-singing');
                }, 100);
            });
        }
    }

    function initGiftPage() {
        const trigger = document.getElementById("present-trigger");
        const presentImage = document.getElementById("present-image");
        const giftCardFrame = document.getElementById("gift-card-frame");
        const giftCard = document.getElementById("gift-card");
        const hornAudio = document.getElementById("horn-audio");
        const sparkleOverlay = document.getElementById("sparkle-overlay");
        const starburst = document.getElementById("starburst-gift");
        const replayButton = document.getElementById("replay-button");

        if (!trigger || !presentImage || !giftCardFrame || !giftCard) {
            return;
        }

        // Enable replay button if password is stored
        if (replayButton) {
            try {
                const hasPassword = sessionStorage.getItem('birthday_password');
                if (hasPassword) {
                    replayButton.disabled = false;
                    replayButton.title = "Play the celebration again";

                    replayButton.addEventListener('click', () => {
                        window.location.href = 'index.html';
                    });
                }
            } catch (e) {
                // Keep button disabled if sessionStorage is not available
            }
        }

        let revealStarted = false;

        const playHorn = () => {
            if (!hornAudio) {
                return;
            }
            try {
                hornAudio.currentTime = 0;
            } catch (e) {
                /* noop */
            }
            const hornPromise = hornAudio.play();
            if (hornPromise && typeof hornPromise.then === "function") {
                hornPromise.catch(() => {
                    // If audio can't play, we simply continue without blocking the animation.
                });
            }
        };

        const revealGift = () => {
            if (revealStarted) {
                return;
            }
            revealStarted = true;
            trigger.disabled = true;

            fireConfettiBurst({ origin: { x: 0.5, y: 0.6 }, particleCount: 180, spread: 90, scalar: 1.1 });
            startConfettiLoop();
            if (!prefersReducedMotion()) {
                sparkleOverlay?.classList.add("is-active");
            }
            playHorn();

            if (prefersReducedMotion() || !window.gsap) {
                presentImage.style.opacity = "0";
                presentImage.style.transform = "scale(0.2)";
                giftCardFrame.classList.add("is-visible");
                giftCard.style.opacity = "1";
                giftCard.style.transform = "scale(1)";
                return;
            }

            gsap.set(giftCard, { opacity: 0, scale: 0.85, rotate: -6 });
            gsap.set(giftCardFrame, { pointerEvents: "auto" });

            const tl = gsap.timeline({ defaults: { ease: "back.out(1.8)" } });

            tl.to(presentImage, {
                duration: 0.35,
                rotate: 12,
                y: -14,
                ease: "back.out(2)",
                yoyo: true,
                repeat: 1
            });

            tl.to(presentImage, {
                duration: 0.6,
                rotate: -360,
                scale: 0.12,
                opacity: 0,
                ease: "back.in(1.9)"
            });

            tl.set(presentImage, { visibility: "hidden" });

            tl.add(() => {
                giftCardFrame.classList.add("is-visible");
            });

            tl.fromTo(
                giftCard,
                { opacity: 0, scale: 0.82, rotate: -6 },
                { opacity: 1, scale: 1, rotate: 0, duration: 0.75 }
            );

            tl.to(
                giftCardFrame,
                {
                    duration: 1.6,
                    y: -10,
                    yoyo: true,
                    repeat: -1,
                    ease: "sine.inOut"
                },
                "-=0.2"
            );
        };

        trigger.addEventListener("click", revealGift);
        trigger.addEventListener("keydown", (event) => {
            if ((event.key === "Enter" || event.key === " ") && !revealStarted) {
                event.preventDefault();
                revealGift();
            }
        });
    }

    function animateFaces(faces, orbit) {
        if (!Array.isArray(faces) || !faces.length || !orbit) {
            return;
        }

        arrangeFacesInCircle(faces, orbit);

        if (prefersReducedMotion() || !window.gsap) {
            faces.forEach((face) => {
                if (window.gsap) {
                    gsap.set(face, { opacity: 1, scale: 1, rotate: 0 });
                } else {
                    face.style.opacity = "1";
                }
                face.classList.add("face-visible");
            });
            return;
        }

        faces.forEach((face, index) => {
            gsap.fromTo(
                face,
                { opacity: 0, scale: 0.3 },
                {
                    opacity: 1,
                    scale: 1,
                    duration: 0.55,
                    ease: "back.out(2.2)",
                    delay: index * 0.12
                }
            );
            scheduleOrientationShuffle(face);
        });

        const baseRotation = gsap.to(orbit, {
            rotation: 360,
            duration: 12,
            ease: "none",
            repeat: -1
        });

        createSpeedPulseLoop(baseRotation);

        if (!orbit.dataset.resizeListenerAttached) {
            let resizeThrottle;
            const handleResize = () => arrangeFacesInCircle(faces, orbit);
            window.addEventListener("resize", () => {
                clearTimeout(resizeThrottle);
                resizeThrottle = setTimeout(handleResize, 160);
            });
            orbit.dataset.resizeListenerAttached = "true";
        }
    }

    function arrangeFacesInCircle(faces, orbit) {
        const rect = orbit.getBoundingClientRect();
        const diameter = Math.min(rect.width, rect.height);
        const sampleFace = faces[0];
        const faceRect = sampleFace?.getBoundingClientRect();
        const faceSize = faceRect?.width || diameter / Math.max(faces.length / 1.2, 3);
        const radius = Math.max((diameter - faceSize) / 2, 12);

        faces.forEach((face, index) => {
            const angle = (index / faces.length) * Math.PI * 2;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            const counterRotation = -(index / faces.length) * 360;

            // Position the container without rotation
            if (window.gsap) {
                gsap.set(face, { x, y, transformOrigin: "50% 50%" });
                // Apply counter-rotation to the img element to keep it upright
                const img = face.querySelector('img');
                if (img) {
                    gsap.set(img, { rotation: counterRotation, transformOrigin: "50% 50%" });
                }
            } else {
                face.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px) scale(1)`;
                const img = face.querySelector('img');
                if (img) {
                    img.style.transform = `rotate(${counterRotation}deg)`;
                }
            }
        });
    }

    function scheduleOrientationShuffle(face) {
        if (!window.gsap || prefersReducedMotion() || face.dataset.shuffleAttached) {
            return;
        }

        face.dataset.shuffleAttached = "true";

        const shuffle = () => {
            const currentRotation = gsap.getProperty(face, "rotation") || 0;
            const minSwing = 50;
            const maxSwing = 75;
            const swingAmount = minSwing + Math.random() * (maxSwing - minSwing);
            const direction = Math.random() > 0.5 ? 1 : -1;
            let targetRotation = currentRotation + (swingAmount * direction);

            if (targetRotation > 75) targetRotation = 75;
            if (targetRotation < -75) targetRotation = -75;

            gsap.to(face, {
                rotation: targetRotation,
                duration: 0.5,
                ease: "power2.inOut"
            });

            gsap.delayedCall(1.5, shuffle);
        };

        gsap.delayedCall(0.8 + Math.random() * 1.2, shuffle);
    }

    function activateRaveOverlay(element, options = {}) {
        if (prefersReducedMotion() || !element) {
            return;
        }

        const { intense = false } = options;
        element.classList.toggle("rave-overlay--intense", intense);
        element.classList.add("is-active");
    }

    function triggerStarburst(element, options = {}) {
        if (!element || !window.gsap || prefersReducedMotion()) {
            return;
        }

        const { scale = 1.35, duration = 1.1 } = options;

        gsap.fromTo(
            element,
            { opacity: 0, scale: 0.1, rotate: 0 },
            {
                opacity: 1,
                scale,
                rotate: 90,
                duration,
                ease: "expo.out",
                onComplete: () => {
                    gsap.to(element, {
                        opacity: 0,
                        scale: scale * 1.1,
                        duration: 0.6,
                        ease: "expo.in",
                        delay: 0.2
                    });
                }
            }
        );
    }

    function launchMegaConfetti(baseConfig = {}) {
        if (prefersReducedMotion()) {
            return;
        }

        const bursts = [
            { delay: 0, particleCount: 220, spread: 120, startVelocity: 60 },
            { delay: 260, origin: { x: 0.25, y: baseConfig.origin?.y ?? 0.7 }, particleCount: 140, spread: 150, scalar: 1.2 },
            { delay: 480, origin: { x: 0.75, y: baseConfig.origin?.y ?? 0.7 }, particleCount: 140, spread: 150, scalar: 1.2 }
        ];

        bursts.forEach((entry) => {
            const { delay = 0, ...burst } = entry;
            setTimeout(() => {
                fireConfettiBurst({ ...baseConfig, ...burst });
            }, delay);
        });
    }

    function startConfettiLoop() {
        if (prefersReducedMotion()) {
            return;
        }

        let loopRunning = false;

        const loopConfetti = () => {
            if (loopRunning) return;
            loopRunning = true;

            fireConfettiBurst({ particleCount: 80, spread: 60, startVelocity: 35 });

            setTimeout(() => {
                loopRunning = false;
                loopConfetti();
            }, 3500);
        };

        loopConfetti();
    }

    function fireConfettiBurst(config = {}) {
        if (prefersReducedMotion()) {
            return;
        }
        if (typeof window.confetti !== "function") {
            return;
        }

        const base = {
            particleCount: config.particleCount ?? 130,
            spread: config.spread ?? 75,
            startVelocity: config.startVelocity ?? 45,
            gravity: config.gravity ?? 0.85,
            scalar: config.scalar ?? 0.9,
            ticks: config.ticks ?? 150,
            origin: config.origin ?? { x: 0.5, y: 0.7 },
            colors: CONFETTI_COLORS
        };

        window.confetti({ ...base });

        setTimeout(() => {
            window.confetti({
                ...base,
                particleCount: Math.round(base.particleCount * 0.6),
                origin: { x: 0.2, y: base.origin.y },
                angle: 60
            });
        }, 180);

        setTimeout(() => {
            window.confetti({
                ...base,
                particleCount: Math.round(base.particleCount * 0.6),
                origin: { x: 0.8, y: base.origin.y },
                angle: 120
            });
        }, 340);
    }

    function createSpeedPulseLoop(rotationTween) {
        if (!window.gsap || prefersReducedMotion() || !rotationTween) {
            return;
        }

        const tl = gsap.timeline({ repeat: -1 });

        // Accelerate to 2.5x speed over 2.5 seconds
        tl.to(rotationTween, {
            timeScale: 2.5,
            duration: 2.5,
            ease: "power2.in"
        });

        // Decelerate back to normal speed over 2.5 seconds
        tl.to(rotationTween, {
            timeScale: 1,
            duration: 2.5,
            ease: "power2.out"
        });
    }

    function prefersReducedMotion() {
        return !!reduceMotionQuery?.matches;
    }
})();
