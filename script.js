// Bit Pizzeria — script.js
document.addEventListener('DOMContentLoaded', ()=>{
  // year
  document.getElementById('year').textContent = new Date().getFullYear();

  // nav toggle
  const navToggle = document.getElementById('nav-toggle');
  const navLinks = document.getElementById('nav-links');
  navToggle.addEventListener('click', ()=>{
    const expanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!expanded));
    if(navLinks.style.display === 'flex') navLinks.style.display = '';
    else navLinks.style.display = 'flex';
  });

  // btc modal
  const btcBtn = document.getElementById('pay-btc');
  const btcModal = document.getElementById('btc-modal');
  const btcClose = document.getElementById('btc-close');

  function closeOverlay(root){
    if(!root || root.hidden) return;
    // set hidden + aria-hidden for accessibility
    try{ root.hidden = true; root.setAttribute('aria-hidden','true'); }catch(e){}
    // fallback: also set display none briefly to ensure it is non-interactive in all browsers
    try{ root.style.display = 'none'; setTimeout(()=>{ root.style.display = ''; }, 30); }catch(e){}
    root.dispatchEvent(new CustomEvent('closed'));
    // return focus to main content for accessibility
    document.getElementById('main')?.focus();
  }

  btcBtn.addEventListener('click', ()=>{
    btcModal.hidden = false;
    // focus first focusable in modal for accessibility
    setTimeout(()=>{
      const focusable = btcModal.querySelector('button, [href], input, select, textarea');
      if(focusable) focusable.focus();
    }, 60);
  });

  // explicit close handlers (click + pointerdown for touch)
  if(btcClose){
    // capture click to ensure we get the event before overlay interference
    btcClose.addEventListener('click', (e)=>{ e.preventDefault(); closeOverlay(btcModal); }, {capture:true});
    btcClose.addEventListener('pointerdown', (e)=>{ e.preventDefault(); closeOverlay(btcModal); }, {passive:false});
    btcClose.addEventListener('pointerup', (e)=>{ e.preventDefault(); closeOverlay(btcModal); });
    btcClose.addEventListener('touchend', (e)=>{ e.preventDefault(); closeOverlay(btcModal); }, {passive:false});
  }

  // close modal by clicking the backdrop
  btcModal.addEventListener('click', (e)=>{ if(e.target === btcModal) closeOverlay(btcModal); });

  // generic dismiss handler for overlays / toasts (matching data-dismiss or common classes)
  document.addEventListener('click', (e)=>{
    const dismiss = e.target.closest('[data-dismiss], .modal-close, .toast-close, button[aria-label="Close"]');
    if(!dismiss) return;
    const root = dismiss.closest('.modal, .toast, .overlay');
    if(root){
      e.preventDefault(); e.stopPropagation();
      closeOverlay(root);
    }
  });

  // close modal with Escape
  document.addEventListener('keydown', (e)=>{ if(e.key === 'Escape' && !btcModal.hidden) btcModal.hidden = true; });

  // Pizza Day countdown (Feb 9)
  const countdown = document.getElementById('countdown');
  function updateCountdown(){
    const now = new Date();
    const year = now.getFullYear();
    let pizzaDay = new Date(year,1,9); // Feb 9 (month is 0-based)
    if(now > pizzaDay) pizzaDay = new Date(year+1,1,9);
    const diff = pizzaDay - now;
    const days = Math.floor(diff / (1000*60*60*24));
      if(days === 0 && now.getDate() === 9 && now.getMonth() === 1){
      countdown.textContent = '🎉 Happy Pizza Day! Enjoy 50% off when you pay with BTC today.';
      document.body.classList.add('celebrate');
    } else {
      countdown.textContent = `Only ${days} day${days!==1?'s':''} until Pizza Day — plan your Satoshi slice!`;
      document.body.classList.remove('celebrate');
    }
  }
  updateCountdown();
  setInterval(updateCountdown, 60*60*1000); // update hourly

  // entrance animations (stagger)
  requestAnimationFrame(()=>{
    const items = document.querySelectorAll('[data-animate="item"], [data-animate="card"]');
    items.forEach((el,i)=> el.style.animationDelay = (i*80)+'ms');
    const stagger = document.querySelectorAll('[data-animate="stagger"] [data-animate="item"]');
    stagger.forEach((el,i)=> el.style.animationDelay = (i*90)+'ms');
    document.body.classList.add('animate-in');
  });

  // subtle coin float
  const brandCoin = document.querySelector('.coin');
  if(brandCoin) brandCoin.classList.add('float');

  /* ===== Confetti (sprites, sound, stats) ===== */
  (function(){
    const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const canvas = document.getElementById('confetti-canvas');
    if(!canvas || prefersReduced) return;
    const ctx = canvas.getContext('2d');
    let W = window.innerWidth, H = window.innerHeight;
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const emojiChoices = ['🍕','₿'];
    const colors = ['#f2a900','#f37b21','#ffea9c','#ff6b6b','#d38bff'];
    let particles = [];
    let totalLaunched = 0;

    // sprite images
    const spriteImgs = { pizza: new Image(), bitcoin: new Image() };
    let spritesLoaded = false;
    let spriteLoadCount = 0;
    spriteImgs.pizza.src = 'assets/pizza-emoji.svg';
    spriteImgs.bitcoin.src = 'assets/bitcoin-emoji.svg';
    [spriteImgs.pizza, spriteImgs.bitcoin].forEach(img=> img.addEventListener('load', ()=>{ spriteLoadCount++; if(spriteLoadCount===2) spritesLoaded = true; }));

    function resize(){
      W = window.innerWidth; H = window.innerHeight;
      canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    window.addEventListener('resize', resize);
    resize();

    function random(min,max){ return Math.random()*(max-min)+min }
    function createParticle(x,y,useEmoji,useSprite){
      return {
        x, y,
        vx: random(-6,6),
        vy: random(-12,-4),
        size: Math.round(random(10,22)),
        color: colors[Math.floor(Math.random()*colors.length)],
        rot: random(0,360),
        rotSpeed: random(-6,6),
        life: 0,
        ttl: random(60,140),
        emoji: useEmoji ? emojiChoices[Math.floor(Math.random()*emojiChoices.length)] : null,
        sprite: useSprite ? (Math.random()<0.5 ? 'pizza' : 'bitcoin') : null
      };
    }

    // audio (short pop) for bursts
    let audioCtx = null;
    function initAudio(){
      try{
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }catch(e){ audioCtx = null; }
    }
    function playPop(){
      const soundEnabled = document.getElementById('confetti-sound')?.checked;
      if(!soundEnabled) return;
      if(!audioCtx) initAudio();
      if(!audioCtx) return;
      // small percussive burst
      const o = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      o.type = 'triangle'; o.frequency.value = 700 + Math.random()*400;
      g.gain.value = 0.08;
      o.connect(g); g.connect(audioCtx.destination);
      o.start();
      g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.12);
      setTimeout(()=> o.stop(), 150);
    }

    let running = false;
    function update(){
      ctx.clearRect(0,0,W,H);
      for(let i = particles.length-1;i>=0;i--){
        const p = particles[i];
        p.vy += 0.45; // gravity
        p.x += p.vx; p.y += p.vy; p.rot += p.rotSpeed; p.life++;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot * Math.PI / 180);
        if(p.sprite && spritesLoaded){
          const img = p.sprite === 'pizza' ? spriteImgs.pizza : spriteImgs.bitcoin;
          const s = p.size * 1.1;
          ctx.drawImage(img, -s/2, -s/2, s, s);
        } else if(p.emoji){
          ctx.fillStyle = p.color;
          ctx.font = `${Math.round(p.size)}px serif`;
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText(p.emoji, 0, 0);
        } else {
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size);
        }
        ctx.restore();
        if(p.y > H + 80 || p.life > p.ttl) particles.splice(i,1);
      }
      if(particles.length>0) requestAnimationFrame(update);
      else running = false;
    }

    function burst(count=80, useEmoji=true, useSprite=false){
      const maxAdd = 350; // clamp to avoid overloading
      count = Math.min(count, maxAdd);
      for(let i=0;i<count;i++){
        const preferEmoji = useEmoji && Math.random() < 0.66;
        const preferSprite = useSprite && spritesLoaded && Math.random() < 0.66;
        // if sprite requested but not loaded, fallback
        particles.push(createParticle(random(W*0.2,W*0.8), random(H*0.15,H*0.45), preferEmoji && !preferSprite, preferSprite));
      }
      totalLaunched += count; // update stats
      const countEl = document.getElementById('confetti-count'); if(countEl) countEl.textContent = String(totalLaunched);
      // play a short pop
      playPop();
      if(!running){ running = true; requestAnimationFrame(update); }
    }

    // Hook up to UI
    const celebrateBtn = document.getElementById('celebrate-btn');
    const confettiEmojiCheckbox = document.getElementById('confetti-emoji');
    const confettiSpriteCheckbox = document.getElementById('confetti-sprite');
    if(celebrateBtn) celebrateBtn.addEventListener('click', (e)=>{
      // resume audio if needed (gesture)
      if(window?.AudioContext || window?.webkitAudioContext){
        try{ if(audioCtx && audioCtx.state === 'suspended') audioCtx.resume(); }catch(e){}
      }
      const useEmoji = confettiEmojiCheckbox ? confettiEmojiCheckbox.checked : true;
      const useSprite = confettiSpriteCheckbox ? confettiSpriteCheckbox.checked : false;
      burst(140, useEmoji, useSprite);
    });

    // When Pizza Day mode is active, do a short burst on load
    const observer = new MutationObserver((mut)=>{
      for(const m of mut){
        if(m.attributeName === 'class'){
          if(document.body.classList.contains('celebrate')){
            const useEmoji = confettiEmojiCheckbox ? confettiEmojiCheckbox.checked : true;
            const useSprite = confettiSpriteCheckbox ? confettiSpriteCheckbox.checked : false;
            burst(160, useEmoji, useSprite);
          }
        }
      }
    });
    observer.observe(document.body, {attributes:true});

  })();

  /* ===== Hero parallax (mouse + idle loop) ===== */
  (function(){
    const hero = document.querySelector('.hero');
    const art = document.querySelector('.hero-art');
    const copy = document.querySelector('.hero-copy');
    if(!hero) return;
    const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Mouse parallax
    function onMove(e){
      const r = hero.getBoundingClientRect();
      const cx = r.left + r.width/2; const cy = r.top + r.height/2;
      const dx = (e.clientX - cx) / (r.width/2);
      const dy = (e.clientY - cy) / (r.height/2);
      const tx = dx * 8; const ty = dy * 6;
      if(art) art.style.transform = `translate3d(${tx}px, ${ty}px, 0) rotate(${dx*2}deg)`;
      if(copy) copy.style.transform = `translate3d(${tx*-0.6}px, ${ty*-0.6}px, 0)`;
    }

    // Idle gentle oscillation
    let t = 0; let rafId = null;
    function idleLoop(){ t += 0.01; const ax = Math.sin(t) * 6; const ay = Math.cos(t*0.7) * 4;
      if(art) art.style.transform = `translate3d(${ax}px, ${ay}px,0)`;
      if(copy) copy.style.transform = `translate3d(${ax*-0.5}px, ${ay*-0.5}px,0)`;
      rafId = requestAnimationFrame(idleLoop);
    }

    if(!prefersReduced){
      hero.addEventListener('mousemove', onMove);
      hero.addEventListener('mouseleave', ()=>{ if(rafId) cancelAnimationFrame(rafId); rafId=null; idleLoop(); });
      // start idle
      idleLoop();
    }

  })();

});
