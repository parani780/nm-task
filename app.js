// Simple DOM CRUD using localStorage
(function(){
  const STORAGE_KEY = 'registrations_v1';
  const form = document.getElementById('reg-form');
  const tableBody = document.querySelector('#reg-table tbody');
  const msgEl = document.getElementById('message');
  const resetBtn = document.getElementById('reset-btn');
  const submitBtn = document.getElementById('submit-btn');
  const formTitle = document.getElementById('form-title');

  // modal elements
  const modal = document.getElementById('confirm-modal');
  const confirmText = document.getElementById('confirm-text');
  const confirmOk = document.getElementById('confirm-ok');
  const confirmCancel = document.getElementById('confirm-cancel');

  let entries = [];
  let editingId = null;
  let pendingDeleteId = null;

  function load(){
    try{
      const raw = localStorage.getItem(STORAGE_KEY);
      entries = raw ? JSON.parse(raw) : [];
    }catch(e){ entries = [] }
  }

  function save(){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }

  function showMessage(text, timeout=2500){
    msgEl.textContent = text;
    setTimeout(()=>{ if(msgEl.textContent === text) msgEl.textContent = '' }, timeout);
  }

  function clearForm(){
    form.reset();
    editingId = null;
    submitBtn.textContent = 'Save';
    formTitle.textContent = 'New Registration';
  }

  function render(){
    tableBody.innerHTML = '';
    if(entries.length === 0){
      const tr = document.createElement('tr');
      const td = document.createElement('td');
      td.colSpan = 5; td.className = 'empty'; td.textContent = 'No registrations yet.';
      tr.appendChild(td); tableBody.appendChild(tr); return;
    }

    entries.forEach(e => {
      const tr = document.createElement('tr');
      const nameTd = document.createElement('td');
      nameTd.textContent = e.firstName + ' ' + e.lastName;
      const emailTd = document.createElement('td'); emailTd.textContent = e.email;
      const phoneTd = document.createElement('td'); phoneTd.textContent = e.phone || '-';
      const profTd = document.createElement('td'); profTd.textContent = e.profession || '-';
      const actionsTd = document.createElement('td');
      actionsTd.className = 'actions';

      const editBtn = document.createElement('button');
      editBtn.className = 'btn'; editBtn.textContent = 'Edit';
      editBtn.addEventListener('click', ()=> startEdit(e.id));

      const delBtn = document.createElement('button');
      delBtn.className = 'btn btn-danger'; delBtn.textContent = 'Delete';
      delBtn.addEventListener('click', ()=> requestDelete(e.id, e.firstName + ' ' + e.lastName));

      actionsTd.appendChild(editBtn); actionsTd.appendChild(delBtn);

      tr.appendChild(nameTd); tr.appendChild(emailTd); tr.appendChild(phoneTd); tr.appendChild(profTd); tr.appendChild(actionsTd);
      tableBody.appendChild(tr);
    });
  }

  function validateForm(data){
    if(!data.firstName.trim() || !data.lastName.trim()) return 'First and last name are required.';
    if(!data.email.trim() || !/^\S+@\S+\.\S+$/.test(data.email)) return 'Valid email is required.';
    if(!data.profession) return 'Please select a profession.';
    return '';
  }

  function startEdit(id){
    const entry = entries.find(x=>x.id===id); if(!entry) return;
    document.getElementById('firstName').value = entry.firstName;
    document.getElementById('lastName').value = entry.lastName;
    document.getElementById('email').value = entry.email;
    document.getElementById('phone').value = entry.phone || '';
    document.getElementById('profession').value = entry.profession || '';
    editingId = id; submitBtn.textContent = 'Update'; formTitle.textContent = 'Edit Registration';
    window.scrollTo({top:0,behavior:'smooth'});
  }

  function requestDelete(id, name){
    pendingDeleteId = id;
    confirmText.textContent = `Delete "${name}"? This cannot be undone.`;
    modal.setAttribute('aria-hidden','false');
  }

  function confirmDelete(){
    if(pendingDeleteId == null) return closeModal();
    entries = entries.filter(e=>e.id !== pendingDeleteId);
    save(); render(); showMessage('Deleted successfully.');
    pendingDeleteId = null; closeModal();
  }

  function closeModal(){ modal.setAttribute('aria-hidden','true'); }

  form.addEventListener('submit', (ev)=>{
    ev.preventDefault();
    const data = {
      firstName: document.getElementById('firstName').value,
      lastName: document.getElementById('lastName').value,
      email: document.getElementById('email').value,
      phone: document.getElementById('phone').value,
      profession: document.getElementById('profession').value
    };

    const err = validateForm(data);
    if(err){ showMessage(err); return }

    if(editingId){
      const idx = entries.findIndex(x=>x.id===editingId);
      if(idx>-1){ entries[idx] = Object.assign({}, entries[idx], data); save(); render(); showMessage('Updated successfully.'); clearForm(); }
    }else{
      const newEntry = Object.assign({id: Date.now().toString()}, data);
      entries.push(newEntry); save(); render(); showMessage('Saved successfully.'); clearForm();
    }
  });

  resetBtn.addEventListener('click', ()=> clearForm());
  confirmOk.addEventListener('click', confirmDelete);
  confirmCancel.addEventListener('click', ()=>{ pendingDeleteId = null; closeModal(); });
  modal.addEventListener('click', (e)=>{ if(e.target === modal) { pendingDeleteId = null; closeModal(); } });

  // init
  load(); render();
})();
