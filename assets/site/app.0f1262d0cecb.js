(() => {
  'use strict';
  document.documentElement.classList.add('js');
  const menu = document.querySelector('#navigation');
  const menuToggle = document.querySelector('.menu-toggle');
  const smallScreen = matchMedia('(max-width: 760px)');
  function closeMenu(restoreFocus = false) {
    menu.classList.remove('is-open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Open navigation');
    if (restoreFocus) menuToggle.focus();
  }
  menuToggle.hidden = false;
  menuToggle.addEventListener('click', () => {
    const open = menuToggle.getAttribute('aria-expanded') !== 'true';
    menu.classList.toggle('is-open', open);
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  });
  menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => closeMenu()));
  document.addEventListener('click', event => {
    if (!menu.contains(event.target) && !menuToggle.contains(event.target)) closeMenu();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') closeMenu(true);
  });
  smallScreen.addEventListener('change', () => closeMenu());

  const cards = [...document.querySelectorAll('.program-card')];
  const filterButtons = [...document.querySelectorAll('[data-filter]')];
  const more = document.querySelector('#more-programs');
  let filter = 'all';
  let expanded = false;
  function updatePrograms() {
    const matching = cards.filter(card => filter === 'all' || card.dataset.category === filter);
    const visible = filter === 'all' && !expanded ? matching.slice(0, 4) : matching;
    cards.forEach(card => { card.hidden = !visible.includes(card); });
    filterButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === filter)));
    more.hidden = filter !== 'all';
    more.setAttribute('aria-expanded', String(expanded));
    more.textContent = expanded ? 'Show fewer programs −' : 'View all 8 programs +';
    document.querySelector('#program-count').textContent = filter === 'all'
      ? `Showing ${visible.length} of ${cards.length} programs`
      : `${visible.length} ${filter === 'mobility' ? 'mobility' : filter} programs`;
  }
  document.querySelector('.filters').hidden = false;
  filterButtons.forEach(button => button.addEventListener('click', () => {
    filter = button.dataset.filter;
    expanded = false;
    updatePrograms();
  }));
  more.addEventListener('click', () => {
    expanded = !expanded;
    updatePrograms();
    if (!expanded) document.querySelector('#classes').scrollIntoView({ behavior: 'instant' });
  });
  updatePrograms();

  const programDialog = document.querySelector('#program-dialog');
  const enquiryDialog = document.querySelector('#enquiry-dialog');
  const message = document.querySelector('#enquiry-message');
  const copyStatus = document.querySelector('#copy-status');
  const programFocus = {
    strength: ['Resistance training fundamentals', 'Equipment confidence', 'Controlled movement and technique'],
    kickboxing: ['Footwork and coordination', 'Striking combinations', 'Cardio-focused movement'],
    yoga: ['Mobility and flexibility', 'Breathing and balance', 'Mindful, controlled movement'],
    hiit: ['Intervals with varied movements', 'Cardiovascular conditioning', 'Effort and recovery'],
    pullups: ['Upper-body control', 'Progressions for your starting point', 'Pulling technique'],
    pushups: ['Upper-body strength', 'Body positioning', 'Controlled repetitions'],
    lunges: ['Lower-body strength', 'Coordination and balance', 'Movement technique'],
    pilates: ['Core control', 'Posture and alignment', 'Mobility and flexibility'],
  };
  let programTrigger = null;
  let enquiryTrigger = null;
  let selectedProgram = '';
  const syncModal = () => document.body.classList.toggle('modal-open', Boolean(document.querySelector('dialog[open]')));
  function openEnquiry(choice, trigger) {
    enquiryTrigger = programDialog.open ? programTrigger : trigger;
    if (programDialog.open) programDialog.close();
    closeMenu();
    document.querySelector('#enquiry-choice').textContent = choice;
    message.value = `Hi Saad Gym Center! I’m interested in ${choice}. Could you share the current details and help me arrange my first visit?`;
    copyStatus.textContent = '';
    enquiryDialog.showModal();
    syncModal();
  }
  document.querySelectorAll('[data-enquiry]').forEach(link => link.addEventListener('click', event => {
    if (typeof enquiryDialog.showModal !== 'function') return;
    event.preventDefault();
    openEnquiry(link.dataset.enquiry, link);
  }));
  document.querySelectorAll('[data-details]').forEach(button => button.addEventListener('click', () => {
    const card = button.closest('.program-card');
    programTrigger = button;
    selectedProgram = card.querySelector('h3').textContent;
    document.querySelector('#program-title').textContent = selectedProgram;
    document.querySelector('#program-category').textContent = card.querySelector('.category').textContent;
    document.querySelector('#program-description').textContent = card.querySelector('p').textContent;
    const photo = document.querySelector('#program-image');
    photo.src = `assets/optimized/${card.dataset.program}-720.webp`;
    photo.alt = card.querySelector('img').alt;
    document.querySelector('#program-focus').replaceChildren(...programFocus[card.dataset.program].map(text => {
      const item = document.createElement('li');
      item.textContent = text;
      return item;
    }));
    programDialog.showModal();
    syncModal();
  }));
  document.querySelector('#program-enquiry').addEventListener('click', event => {
    event.preventDefault();
    openEnquiry(selectedProgram, event.currentTarget);
  });
  document.querySelectorAll('dialog').forEach(dialog => {
    dialog.querySelector('[data-close]').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => {
      const rect = dialog.getBoundingClientRect();
      if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
    });
    dialog.addEventListener('close', () => {
      syncModal();
      if (!document.querySelector('dialog[open]')) (dialog === enquiryDialog ? enquiryTrigger : programTrigger)?.focus({ preventScroll: true });
    });
  });
  document.querySelector('#copy-enquiry').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(message.value);
      copyStatus.textContent = 'Enquiry copied. Open Instagram and paste it into your message.';
    } catch {
      message.focus();
      message.select();
      copyStatus.textContent = 'Select and copy the enquiry, then paste it into your Instagram message.';
    }
  });
  document.querySelector('#year').textContent = String(new Date().getFullYear());
})();
