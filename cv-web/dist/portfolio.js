(() => {
  'use strict';
  const channels = {tc: 'Thanh Cong – TC', vinh: 'Ngô Thiệu Vinh', kidz: 'onchain.kidz'};
  const grid = document.querySelector('#video-grid');
  const dialog = document.querySelector('.video-dialog');
  const player = dialog.querySelector('.player-container');
  const resultCount = document.querySelector('.result-count');
  const cards = [];

  const element = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  };

  portfolioVideos.forEach(video => {
    const card = element('article', 'video-card');
    card.dataset.channel = video.channel;
    card.dataset.platform = video.platform;
    const cover = element('a', 'video-cover');
    cover.href = video.url;
    cover.target = '_blank';
    cover.rel = 'noopener noreferrer';
    cover.dataset.videoId = video.id;
    cover.setAttribute('aria-label', 'Watch ' + video.title);
    const image = element('img');
    image.src = video.thumbnail;
    image.alt = '';
    image.loading = 'lazy';
    image.decoding = 'async';
    image.width = video.platform === 'youtube' ? 960 : 576;
    image.height = video.platform === 'youtube' ? 540 : 1024;
    const play = element('span', 'play-icon', '▶');
    play.setAttribute('aria-hidden', 'true');
    cover.append(image, play, element('span', 'video-format', video.platform === 'youtube' ? 'YOUTUBE · LONG FORM' : 'TIKTOK · SHORT FORM'));
    if (video.duration) cover.append(element('span', 'duration', video.duration));
    const meta = element('p', 'video-meta');
    meta.append(element('span', '', channels[video.channel]), element('span', '', 'Video editing'));
    const title = element('h3');
    const link = element('a', '', video.title);
    link.href = video.url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.dataset.videoId = video.id;
    title.append(link);
    card.append(cover, meta, title);
    cards.push(card);
    grid.append(card);
  });

  document.querySelector('.filters').hidden = false;
  resultCount.textContent = portfolioVideos.length + ' videos';
  document.querySelectorAll('[data-filter]').forEach(button => {
    button.addEventListener('click', () => {
      const filter = button.dataset.filter;
      document.querySelectorAll('[data-filter]').forEach(other => other.setAttribute('aria-pressed', String(other === button)));
      let count = 0;
      cards.forEach(card => {
        card.hidden = filter !== 'all' && card.dataset.channel !== filter;
        if (!card.hidden) count++;
      });
      resultCount.textContent = count + ' videos' + (filter === 'all' ? '' : ' · ' + channels[filter]);
    });
  });

  document.addEventListener('click', event => {
    const link = event.target.closest('[data-video-id]');
    if (!link || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0 || typeof dialog.showModal !== 'function') return;
    const video = portfolioVideos.find(item => item.id === link.dataset.videoId);
    if (!video) return;
    event.preventDefault();
    const vertical = video.platform === 'tiktok';
    dialog.classList.toggle('is-vertical', vertical);
    document.querySelector('#player-title').textContent = video.title;
    document.querySelector('#player-channel').textContent = channels[video.channel] + ' / Video editing';
    document.querySelector('#watch-original').href = video.url;
    const frame = element('iframe');
    frame.title = video.title;
    frame.src = vertical
      ? 'https://www.tiktok.com/player/v1/' + video.id + '?autoplay=1&rel=0'
      : 'https://www.youtube.com/embed/' + video.id + '?autoplay=1&rel=0';
    frame.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
    frame.referrerPolicy = 'strict-origin-when-cross-origin';
    frame.allowFullscreen = true;
    player.replaceChildren(frame);
    document.body.classList.add('player-open');
    dialog.showModal();
  });
  dialog.querySelector('.close-player').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const box = dialog.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    player.replaceChildren();
    document.body.classList.remove('player-open');
  });
})();
