'use strict';

document.getElementById('fyear').textContent = new Date().getFullYear();

(function(){
  const u = 'workwithraine';
  const d = 'gmail.com';
  const addr = u + '\u0040' + d;
  const el = document.getElementById('emailDisplay');
  if(el){
    const a = document.createElement('a');
    a.href = 'mailto:' + addr;
    a.textContent = addr;
    a.style.color = 'inherit';
    el.appendChild(a);
  }
})();

if(window.matchMedia('(pointer: fine)').matches){
  const dot = document.getElementById('cursorDot')?.firstElementChild;
  const ring = document.getElementById('cursorRing');
  if(dot && ring){
    let mx=0,my=0,rx=0,ry=0;
    document.addEventListener('mousemove', e => { mx=e.clientX; my=e.clientY; }, {passive:true});
    (function animCursor(){
      dot.style.transform=`translate(${mx}px,${my}px) translate(-50%,-50%)`;
      rx+=(mx-rx)*0.12; ry+=(my-ry)*0.12;
      ring.style.transform=`translate(${rx}px,${ry}px) translate(-50%,-50%)`;
      requestAnimationFrame(animCursor);
    })();
    document.querySelectorAll('a,button,.card').forEach(el=>{
      el.addEventListener('mouseenter',()=>ring.classList.add('hover'));
      el.addEventListener('mouseleave',()=>ring.classList.remove('hover'));
    });
  }
}

const navbar = document.getElementById('navbar');
window.addEventListener('scroll', ()=>navbar.classList.toggle('scrolled', window.scrollY>60), {passive:true});

const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');
if(navToggle && navMenu){
  navToggle.addEventListener('click', ()=>{
    const open = navMenu.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', open);
    navToggle.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
  });
  navMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', ()=>{
    navMenu.classList.remove('open');
    navToggle.setAttribute('aria-expanded','false');
    navToggle.setAttribute('aria-label','Open navigation menu');
  }));
  document.addEventListener('keydown', e => {
    if(e.key==='Escape' && navMenu.classList.contains('open')){
      navMenu.classList.remove('open');
      navToggle.setAttribute('aria-expanded','false');
      navToggle.focus();
    }
  });
}


const tabs = document.querySelectorAll('.tab-btn');
const cards = document.querySelectorAll('.card[data-cat]');
const announcer = document.getElementById('gridAnnouncer');

function filterCards(filter){
  let shown = 0;
  cards.forEach(card => {
    const match = filter==='all' || card.dataset.cat===filter;
    if(match){
      card.classList.add('show');
      card.style.opacity='0';
      card.style.transform='translateY(16px)';
      card.style.transition='none';
      setTimeout(()=>{
        card.style.transition='opacity 0.4s ease, transform 0.4s ease';
        card.style.opacity='1';
        card.style.transform='translateY(0)';
      }, shown * 55);
      shown++;
    } else {
      card.classList.remove('show');
    }
  });
  if(announcer){
    const label = filter==='all' ? 'all platforms' : filter;
    announcer.textContent = `Showing ${shown} ${label} project${shown!==1?'s':''}.`;
  }
}

tabs.forEach((tab, idx) => {
  tab.addEventListener('click', ()=>{
    tabs.forEach(t=>{ t.classList.remove('active'); t.setAttribute('aria-selected','false'); });
    tab.classList.add('active'); tab.setAttribute('aria-selected','true');
    filterCards(tab.dataset.tab);
  });
  tab.addEventListener('keydown', e => {
    let newIdx = idx;
    if(e.key==='ArrowRight') newIdx=(idx+1)%tabs.length;
    else if(e.key==='ArrowLeft') newIdx=(idx-1+tabs.length)%tabs.length;
    else if(e.key==='Home') newIdx=0;
    else if(e.key==='End') newIdx=tabs.length-1;
    else return;
    e.preventDefault();
    tabs[newIdx].focus();
    tabs[newIdx].click();
  });
});

if('IntersectionObserver' in window){
  const revObs = new IntersectionObserver(entries=>{
    entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); revObs.unobserve(e.target); } });
  }, {threshold:0.1});
  document.querySelectorAll('.reveal').forEach(el=>revObs.observe(el));
  const cardObs = new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        e.target.style.transition='opacity 0.6s ease, transform 0.6s ease';
        e.target.style.opacity='1'; e.target.style.transform='translateY(0)';
        cardObs.unobserve(e.target);
      }
    });
  }, {threshold:0.07});
  cards.forEach(c=>{ c.style.opacity='0'; c.style.transform='translateY(20px)'; cardObs.observe(c); });
} else {
  document.querySelectorAll('.reveal').forEach(el=>el.classList.add('in'));
}

const msgArea = document.getElementById('message');
const msgCounter = document.getElementById('msgCounter');
msgArea?.addEventListener('input', ()=>{
  const len = msgArea.value.length;
  if(msgCounter) msgCounter.textContent = `${len} / 2000`;
  if(msgCounter) msgCounter.style.color = len>1800 ? '#e07070' : 'rgba(245,240,232,0.35)';
});

const form = document.getElementById('contactForm');
const submitBtn = document.getElementById('submitBtn');
const formStatus = document.getElementById('formStatus');

function sanitise(str){
  return String(str).replace(/<[^>]*>/g,'').replace(/[\u0000-\u001F\u007F]/g,'').trim();
}
function isValidEmail(email){
  return /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,}$/.test(email) && email.length<=254;
}
function showStatus(msg, type){
  if(!formStatus) return;
  formStatus.textContent = sanitise(msg); 
  formStatus.className = 'form-status ' + type;
  formStatus.style.display = 'block';
  formStatus.scrollIntoView({behavior:'smooth', block:'nearest'});
}

let lastSubmit = 0;
const COOLDOWN = 30000;

form?.addEventListener('submit', async e => {
  e.preventDefault();

  const now = Date.now();
  if(now - lastSubmit < COOLDOWN){
    const wait = Math.ceil((COOLDOWN-(now-lastSubmit))/1000);
    showStatus(`Please wait ${wait} seconds before submitting again.`, 'error');
    return;
  }

  const hp = form.querySelector('[name="_gotcha"]');
  if(hp && hp.value.trim() !== ''){
    showStatus('Thank you! Your message has been sent.', 'success');
    form.reset(); return;
  }

  const fname    = sanitise(form.fname.value);
  const lname    = sanitise(form.lname.value);
  const email    = sanitise(form.email.value);
  const platform = sanitise(form.platform.value);
  const message  = sanitise(form.message.value);

  const errors = [];
  if(fname.length < 2)     errors.push(['fname','Please enter your first name (at least 2 characters).']);
  if(lname.length < 2)     errors.push(['lname','Please enter your last name (at least 2 characters).']);
  if(!isValidEmail(email)) errors.push(['email','Please enter a valid email address.']);
  if(!platform)            errors.push(['platform','Please select a platform.']);
  if(message.length < 20)  errors.push(['message','Please describe your project (at least 20 characters).']);

  if(errors.length > 0){
    const [firstField, firstMsg] = errors[0];
    showStatus(firstMsg, 'error');
    form.querySelector(`[name="${firstField}"]`)?.focus();
    form.querySelector(`[name="${firstField}"]`)?.setAttribute('aria-invalid','true');
    return;
  }

  form.querySelectorAll('[aria-invalid]').forEach(el=>el.removeAttribute('aria-invalid'));

  const subjectEl = document.getElementById('emailSubject');
  if(subjectEl) subjectEl.value = `New inquiry from ${fname} ${lname} — ${platform}`;

  submitBtn.disabled = true;
  submitBtn.textContent = 'Sending…';
  formStatus.style.display = 'none';

  try {
    const res = await fetch(form.action, {
      method: 'POST',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ fname, lname, email, platform, message, _replyto: email }),
    });

    if(res.ok){
      lastSubmit = Date.now();
      showStatus('✓ Message sent! I\'ll get back to you within 24 hours.', 'success');
      form.reset();
      if(msgCounter) msgCounter.textContent = '0 / 2000';
    } else {
      const data = await res.json().catch(()=>({}));
      const serverMsg = data?.errors?.[0]?.message || 'Something went wrong. Please try again.';
      showStatus(serverMsg, 'error'); 
    }
  } catch {
    showStatus('Network error. Please check your connection, or email me directly.', 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Send Message';
  }
});

document.querySelectorAll('.faq-question').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.faq-item');
    const isOpen = item.classList.contains('open');

    // Close all
    document.querySelectorAll('.faq-item.open').forEach(el => {
      el.classList.remove('open');
      el.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
    });

    // Open clicked (if it was closed)
    if (!isOpen) {
      item.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
    }
  });

  btn.addEventListener('keydown', e => {
    const allBtns = [...document.querySelectorAll('.faq-question')];
    const idx = allBtns.indexOf(btn);
    if (e.key === 'ArrowDown') { e.preventDefault(); allBtns[Math.min(idx+1, allBtns.length-1)]?.focus(); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); allBtns[Math.max(idx-1, 0)]?.focus(); }
  });
});

if ('IntersectionObserver' in window) {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); obs.unobserve(e.target); }
    });
  }, { threshold: 0.08 });
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
} else {
  document.querySelectorAll('.reveal').forEach(el => el.classList.add('in'));
}