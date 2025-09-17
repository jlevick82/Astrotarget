
// Theme + Install controls injected into header .tools
(function(){
  const tools = document.querySelector('header .tools');
  if(!tools) return;
  const btnNight = document.createElement('button');
  btnNight.type='button';
  btnNight.textContent='Night Mode';
  btnNight.className='btn';
  const btnDark = document.createElement('button');
  btnDark.type='button';
  btnDark.textContent='Dark Mode';
  btnDark.className='btn muted';
  const btnInstall = document.createElement('button');
  btnInstall.type='button';
  btnInstall.textContent='Install';
  btnInstall.className='btn';
  tools.append(btnNight, btnDark, btnInstall);

  // Restore theme
  const saved = localStorage.getItem('gng.theme') || 'dark';
  if(saved==='night') document.documentElement.classList.add('night');

  btnNight.addEventListener('click', ()=>{
    document.documentElement.classList.add('night');
    localStorage.setItem('gng.theme','night');
  });
  btnDark.addEventListener('click', ()=>{
    document.documentElement.classList.remove('night');
    localStorage.setItem('gng.theme','dark');
  });

  // PWA install prompt
  let deferred;
  window.addEventListener('beforeinstallprompt', (e)=>{
    e.preventDefault();
    deferred = e;
    btnInstall.disabled = false;
  });
  btnInstall.disabled = true;
  btnInstall.addEventListener('click', async ()=>{
    if(!deferred) return;
    deferred.prompt();
    const { outcome } = await deferred.userChoice;
    deferred = null;
  });
})();
