'use strict';
const pageTitles = ['Overview','Research','Choices + AI','Physical interaction','Exhibition'];
const pageDialog = document.querySelector('#page-dialog');
const zoomImage = document.querySelector('#zoom-image');
const stage = document.querySelector('.image-stage');
const zoomLevel = document.querySelector('#zoom-level');
let currentPage = 0;
let scale = 1;
let mediaData = {};
const mediaReady = fetch('media.json').then(response => {
  if (!response.ok) throw new Error('Media index unavailable');
  return response.json();
}).then(data => { mediaData = data; });
mediaReady.catch(() => {});

function fitScale(){return Math.min(1, (pageDialog.clientWidth - (innerWidth < 650 ? 24 : 40)) / 2520);}
function setScale(value){scale = Math.max(.12, Math.min(2,value));zoomImage.style.width = Math.round(2520 * scale) + 'px';zoomLevel.value = Math.round(scale * 100) + '%';}
function showPage(index){
  currentPage = Math.max(0, Math.min(4,index));
  zoomImage.src = `page-${String(currentPage+1).padStart(2,'0')}.png`;
  zoomImage.alt = `Page ${currentPage+1}: ${pageTitles[currentPage]}`;
  document.querySelector('#zoom-title').textContent = `${String(currentPage+1).padStart(2,'0')} / ${pageTitles[currentPage]}`;
  document.querySelector('#prev-page').disabled = currentPage === 0;
  document.querySelector('#next-page').disabled = currentPage === 4;
  if(!pageDialog.open) pageDialog.showModal();
  document.body.classList.add('modal-open');
  setScale(fitScale());stage.scrollTo(0,0);
}
document.querySelectorAll('[data-page]').forEach(link => link.addEventListener('click',event => {event.preventDefault();showPage(Number(link.dataset.page));}));
document.querySelector('#close-page').addEventListener('click',() => pageDialog.close());
document.querySelector('#zoom-in').addEventListener('click',() => setScale(scale * 1.3));
document.querySelector('#zoom-out').addEventListener('click',() => setScale(scale / 1.3));
document.querySelector('#fit-page').addEventListener('click',() => {setScale(fitScale());stage.scrollTo(0,0);});
document.querySelector('#actual-size').addEventListener('click',() => setScale(1));
document.querySelector('#prev-page').addEventListener('click',() => showPage(currentPage-1));
document.querySelector('#next-page').addEventListener('click',() => showPage(currentPage+1));
pageDialog.addEventListener('close',() => document.body.classList.remove('modal-open'));
pageDialog.addEventListener('keydown',event => {
  if(event.key === '+' || event.key === '='){event.preventDefault();setScale(scale*1.3);}
  if(event.key === '-'){event.preventDefault();setScale(scale/1.3);}
  if(event.key === 'PageDown' && currentPage < 4){event.preventDefault();showPage(currentPage+1);}
  if(event.key === 'PageUp' && currentPage > 0){event.preventDefault();showPage(currentPage-1);}
});

const mediaDialog = document.querySelector('#media-dialog');
const video = document.querySelector('#video-player');
const audio = document.querySelector('#audio-player');
document.querySelectorAll('[data-media]').forEach(link => link.addEventListener('click',async event => {
  event.preventDefault();
  try{
    await mediaReady;
    const item = mediaData[link.dataset.media];
    if(!item) throw new Error('Missing media');
    video.pause();audio.pause();
    video.hidden = item.type !== 'video';audio.hidden = item.type !== 'audio';
    const player = item.type === 'video' ? video : audio;
    player.src = item.src;
    document.querySelector('#media-title').textContent = item.title;
    document.querySelector('#open-media-file').href = item.src;
    mediaDialog.showModal();document.body.classList.add('modal-open');
    player.play().catch(() => {});
  }catch{window.location.assign(link.href);}
}));
document.querySelector('#close-media').addEventListener('click',() => mediaDialog.close());
mediaDialog.addEventListener('close',() => {video.pause();audio.pause();video.removeAttribute('src');audio.removeAttribute('src');video.load();audio.load();document.body.classList.remove('modal-open');});

const links = [...document.querySelectorAll('nav [data-section]')];
function updateProgress(){
  const scrollable = document.documentElement.scrollHeight - innerHeight;
  document.querySelector('.reading-progress').style.width = `${scrollable > 0 ? Math.min(100,scrollY/scrollable*100) : 0}%`;
  let active = 'overview';
  document.querySelectorAll('.portfolio-page').forEach(section => {if(section.getBoundingClientRect().top < innerHeight*.42) active = section.id;});
  links.forEach(link => {if(link.dataset.section === active)link.setAttribute('aria-current','true');else link.removeAttribute('aria-current');});
}
addEventListener('scroll',updateProgress,{passive:true});addEventListener('resize',updateProgress);updateProgress();
