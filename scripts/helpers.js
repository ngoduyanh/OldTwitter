function arrayBufferToBase64(buffer) {
    let binary = '';
    let bytes = new Uint8Array(buffer);
    let len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
function createModal(html, className, onclose) {
    let modal = document.createElement('div');
    modal.classList.add('modal');
    let modal_content = document.createElement('div');
    modal_content.classList.add('modal-content');
    if(className) modal_content.classList.add(className);
    modal_content.innerHTML = html;
    modal.appendChild(modal_content);
    let close = document.createElement('span');
    close.classList.add('modal-close');
    close.innerHTML = '&times;';
    function escapeEvent(e) {
        if(document.querySelector('.viewer-in')) return;
        if(e.key === 'Escape' || (e.altKey && e.keyCode === 78)) {
            modal.remove();
            let event = new Event('findActiveTweet');
            document.dispatchEvent(event);
            document.removeEventListener('keydown', escapeEvent);
            if(onclose) onclose();
        }
    }
    close.addEventListener('click', () => {
        modal.remove();
        let event = new Event('findActiveTweet');
        document.dispatchEvent(event);
        document.removeEventListener('keydown', escapeEvent);
        if(onclose) onclose();
    });
    modal.addEventListener('click', e => {
        if(e.target === modal) {
            modal.remove();
            let event = new Event('findActiveTweet');
            document.dispatchEvent(event);
            document.removeEventListener('keydown', escapeEvent);
            if(onclose) onclose();
        }
    });
    document.addEventListener('keydown', escapeEvent);
    modal_content.appendChild(close);
    document.body.appendChild(modal);
    return modal;
}
function handleFiles(files, mediaArray, mediaContainer) {
    let images = [];
    let videos = [];
    let gifs = [];
    for (let i = 0; i < files.length; i++) {
        let file = files[i];
        if (file.type.includes('gif')) {
            // max 15 mb
            if (file.size > 15000000) {
                return alert('GIFs must be less than 15 MB');
            }
            gifs.push(file);
        } else if (file.type.includes('video')) {
            // max 500 mb
            if (file.size > 500000000) {
                return alert('Videos must be less than 500 MB');
            }
            videos.push(file);
        } else if (file.type.includes('image')) {
            // max 5 mb
            if (file.size > 5000000) {
                return alert('Images must be less than 5 MB');
            }
            images.push(file);
        }
    }
    // either up to 4 images or 1 video or 1 gif
    if (images.length > 0) {
        if (images.length > 4) {
            images = images.slice(0, 4);
        }
        if (videos.length > 0 || gifs.length > 0) {
            return alert('You can only upload up to 4 images or 1 video or 1 gif');
        }
    }
    if (videos.length > 0) {
        if (images.length > 0 || gifs.length > 0 || videos.length > 1) {
            return alert('You can only upload up to 4 images or 1 video or 1 gif');
        }
    }
    if (gifs.length > 0) {
        if (images.length > 0 || videos.length > 0 || gifs.length > 1) {
            return alert('You can only upload up to 4 images or 1 video or 1 gif');
        }
    }
    // get base64 data
    let media = [...images, ...videos, ...gifs];
    let base64Data = [];
    for (let i = 0; i < media.length; i++) {
        let file = media[i];
        let reader = new FileReader();
        reader.readAsArrayBuffer(file);
        reader.onload = () => {
            base64Data.push(reader.result);
            if (base64Data.length === media.length) {
                mediaContainer.innerHTML = '';
                while (mediaArray.length > 0) {
                    mediaArray.pop();
                }
                base64Data.forEach(data => {
                    let div = document.createElement('div');
                    let img = document.createElement('img');
                    div.title = file.name;
                    div.id = `new-tweet-media-img-${Date.now()}${Math.random()}`.replace('.', '-');
                    div.className = "new-tweet-media-img-div";
                    img.className = "new-tweet-media-img";
                    let progress = document.createElement('span');
                    progress.hidden = true;
                    progress.className = "new-tweet-media-img-progress";
                    let remove = document.createElement('span');
                    remove.className = "new-tweet-media-img-remove";
                    let alt;
                    if (!file.type.includes('video')) {
                        alt = document.createElement('span');
                        alt.className = "new-tweet-media-img-alt";
                        alt.innerText = "ALT";
                        alt.addEventListener('click', () => {
                            mediaObject.alt = prompt('Enter alt text for image');
                        });
                    }
                    let dataBase64 = arrayBufferToBase64(data);
                    let mediaObject = {
                        div, img,
                        id: img.id,
                        data: data,
                        dataBase64: dataBase64,
                        type: file.type,
                        category: file.type.includes('gif') ? 'tweet_gif' : file.type.includes('video') ? 'tweet_video' : 'tweet_image'
                    };
                    mediaArray.push(mediaObject);
                    img.src = file.type.includes('video') ? 'data:image/png;base64,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' : `data:${file.type};base64,${dataBase64}`;
                    remove.addEventListener('click', () => {
                        div.remove();
                        for (let i = mediaArray.length - 1; i >= 0; i--) {
                            let m = mediaArray[i];
                            if (m.id === img.id) mediaArray.splice(i, 1);
                        }
                    });
                    div.append(img, progress, remove);
                    if (!file.type.includes('video')) {
                        img.addEventListener('click', () => {
                            new Viewer(mediaContainer);
                        });
                        div.append(alt);
                    }
                    mediaContainer.append(div);
                });
            }
        }
    }
}
let isURL = (str) => {
    try {
        new URL(str);
        return true;
    } catch (_) {
        return false;
    }
}
function handleDrop(event, mediaArray, mediaContainer) {
    let text = event.dataTransfer.getData("Text").trim();
    if(text.length <= 1) {
        event.stopPropagation();
        event.preventDefault();
        let files = event.dataTransfer.files;
        handleFiles(files, mediaArray, mediaContainer);
    }
}
function getMedia(mediaArray, mediaContainer) {
    let input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = 'image/png,image/jpeg,image/gif,video/mp4,video/mov';
    input.addEventListener('change', () => {
        handleFiles(input.files, mediaArray, mediaContainer);
    });
    input.click();
};
function getDMMedia(mediaArray, mediaContainer, modalElement) {
    let input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,image/gif';
    input.addEventListener('change', async () => {
        let files = input.files;
        let images = [];
        let gifs = [];
        for (let i = 0; i < files.length; i++) {
            let file = files[i];
            if (file.type.includes('gif')) {
                // max 15 mb
                if (file.size > 15000000) {
                    return alert('GIFs must be less than 15 MB');
                }
                gifs.push(file);
            } else if (file.type.includes('image')) {
                // max 5 mb
                if (file.size > 5000000) {
                    return alert('Images must be less than 5 MB');
                }
                images.push(file);
            }
        }
        // get base64 data
        let media = [...images, ...gifs];
        let base64Data = [];
        for (let i = 0; i < media.length; i++) {
            let file = media[i];
            let reader = new FileReader();
            reader.readAsArrayBuffer(file);
            reader.onload = () => {
                base64Data.push(reader.result);
                if (base64Data.length === media.length) {
                    mediaContainer.innerHTML = '';
                    while (mediaArray.length > 0) {
                        mediaArray.pop();
                    }
                    base64Data.forEach(data => {
                        let div = document.createElement('div');
                        let img = document.createElement('img');
                        div.title = file.name;
                        div.id = `new-tweet-media-img-${Date.now()}${Math.random()}`.replace('.', '-');
                        div.className = "new-tweet-media-img-div";
                        img.className = "new-tweet-media-img";
                        let progress = document.createElement('span');
                        progress.hidden = true;
                        progress.className = "new-tweet-media-img-progress";
                        let remove = document.createElement('span');
                        remove.className = "new-tweet-media-img-remove";
                        let dataBase64 = arrayBufferToBase64(data);
                        let mediaObject = {
                            div, img,
                            id: img.id,
                            data: data,
                            dataBase64: dataBase64,
                            type: file.type,
                            category: file.type.includes('gif') ? 'tweet_gif' : file.type.includes('video') ? 'tweet_video' : 'tweet_image'
                        };
                        mediaArray.push(mediaObject);
                        img.src = file.type.includes('video') ? 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAWUSURBVHhe7Z1pqG5THMbPNV1jul1TJEOZuqYMRZEpoRARvlw+uIjwASlRFIkMHwzJ8AVfZMhYOGRKESlDkciQyJhknj3PXu9b3nP2sPba9x3Wfp5f/dpr77p1zl7Ped+11l77f5fMz8/PGV3WGByNKA6AOA6AOA6AOA6AOA6AOA6AOA6AOA6AOA6AOA6AOA6AOA6AOA6AOA6AOA6AOA6AOA6AOA6AOA6AOA6AOA6AOA6AOG3eC1gGl4ammXF+h9+HZj0xAdgC3gwPhw5AHjAAL8Kz4Re8UEVTANaCT8HDijOTGy9B9t1fxVkJTWOAneAhoWky5ADIPqykKQCbQA8U84V9xz6spKlzlwyOJl9q+9B/3eI4AOI0zQIOhs+H5iJeh3fBP4qzcjaDF8DNizPTls/gDfCH4qycDeBZcLfibDEcxL8QmotJDQA7fVf4QXFWz8nwvtA0LTkJPhCatewM34LrFGej1AYg9SvgF/hNaDby8eBo2vPp4NjEl5B90hqPAcRxAMRxAMRxAMRxAMRxAMRJDcCaA2NYe3A07Ym9d236Y4TUAGwET4VlCw//Z124MjRNAmfADUOzEnb8iZB90pouS8H/QC5A1C0FMwDcUWTS4YLbz6FZCgOwFaz6Yx7LUrDJh7EsBZue0KcA/Av/Dk0TS18CwIcm/KjbEV4Nf4Qmgr4E4ErIbdAfwUvhXvB+WLkb1gS6BICzAG5Y+KTG2EfGXVn42PRDeAo8AnLjSs5wplV2b4dy3z/7IokuATgHbtfg9vBuOA04JngOHgjPhJ/D3Lgdlt3XhV4Ek0gNAL9jH4RNg66f4J2hOTX4lgx/hj3gdbBuTj1r3At/C81KuA5zD0wa96QGgB0fO+L+c3CcNt/Bi+G+8BGYw4wh9t616Y8R+jIIbMN78AR4NHyTF5RRDADhoInvPO4Pz4NfQUlUAzCE36+3wN0h34D+FUqhHoAhX8Pz4X7wSZg8rcoNB2CUt+Ex8Hj4Li/0HQdgMRxNPwY5W+D8+lvYW1IDsD6Mfc6/zeCYG3zRgq9lcf3gDsj1hEnDRZ4YNoXsk9Z02Q/wDuRKVd3CysbwQrh1cTY+WL7m2dAcG/vAa+ChcFKvzXN2ciPkGKUK7spaBfmJVYbEhpBJBICwZA7HB1dBPnnMAW8IWY3w6SJf1twb3soLueMApMFnHJfBqFJss4wDkE4vyuc4AGlwqzafLLJ4ZtY4AO0Y7sF/A57OC7nTZRYwSyViJjEL4MDvWjjJaaBLxEQyzgBsCS+Hp8FJl8p1iZgpwpU1LmLxxnJL2TTqJLtEzBTg9/yx8DV4PayttJk7DsAo3BfwOHwYruCFvuMABDhYvQm+Co+CMvdFPQB8e/lcyH0A3Bq2HpRCNQD8vY+Er0BuBZOtZKoYgF3gQ/AJuCcvKJMaAI6UaQyzUiJmOeTyLRewjoOxP/80cYmY1QDn7yy1wvk8t3hx5SwXXCImkrKVQC7XchWMu3iqdsvkwFhLxHQZA/Dfcpl02xonVR9o4d65HSCXn5+GOXc+4X6/sns7lNvtkvuxSwBmiSsgV+/4QIQFIvi0juvo3MJlauhLAPhJ9CjkfP4SmPR9qEhfAmAScQDE6RKAWSoR02dcIkYYl4gRxyVixHGJGDNeHABxHABxHABxHABxHABxUgOgUCJmFuAiTwzyJWL6ikvEmM6MbUeQ6QEOgDhNAeB/umDyprYPmwLAKpkydXN7CPuuttJpUwDehy+HpskQDuDZh5U0zQIIN1zeBg+C0yiSYNrDsrbPQL7wyh1FlcQEYAgrYjkAecAARNUwbBMA00M8DRTHARDHARDHARDHARDHARDHARDHARDHARDHARDHARDHARDHARDHARDHARDHARDHARDHARDHARDHARDHARDHARDHAZBmbu4/x6swK3hIFr4AAAAASUVORK5CYII=' : `data:${file.type};base64,${dataBase64}`;
                        remove.addEventListener('click', () => {
                            div.remove();
                            for (let i = mediaArray.length - 1; i >= 0; i--) {
                                let m = mediaArray[i];
                                if (m.id === img.id) mediaArray.splice(i, 1);
                            }
                        });
                        div.append(img, progress, remove);
                        if (!file.type.includes('video')) {
                            img.addEventListener('click', () => {
                                new Viewer(mediaContainer);
                            });
                        }
                        mediaContainer.append(div);
                        setTimeout(() => modalElement.scrollTop = modalElement.scrollHeight, 50);
                    });
                }
            }
        }
    });
    input.click();
};
function timeElapsed(targetTimestamp) {
    let currentDate = new Date();
    let currentTimeInms = currentDate.getTime();
    let targetDate = new Date(targetTimestamp);
    let targetTimeInms = targetDate.getTime();
    let elapsed = Math.floor((currentTimeInms - targetTimeInms) / 1000);
    const MonthNames = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
    ];
    if (elapsed < 1) {
        return '0s';
    }
    if (elapsed < 60) { //< 60 sec
        return `${elapsed}s`;
    }
    if (elapsed < 3600) { //< 60 minutes
        return `${Math.floor(elapsed / (60))}m`;
    }
    if (elapsed < 86400) { //< 24 hours
        return `${Math.floor(elapsed / (3600))}h`;
    }
    if (elapsed < 604800) { //<7 days
        return `${Math.floor(elapsed / (86400))}d`;
    }
    if (elapsed < 2628000) { //<1 month
        return `${targetDate.getDate()} ${MonthNames[targetDate.getMonth()]}`;
    }
    return `${targetDate.getDate()} ${MonthNames[targetDate.getMonth()]} ${targetDate.getFullYear()}`; //more than a monh
}
function openInNewTab(href) {
    Object.assign(document.createElement('a'), {
        target: '_blank',
        rel: 'noopener noreferrer',
        href: href,
    }).click();
}
function escapeHTML(unsafe) {
    return unsafe
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "’");
 }
function stringInsert(string, index, value) {
    return string.substr(0, index) + value + string.substr(index);
}
function generatePoll(tweet, tweetElement, user) {
    let pollElement = tweetElement.getElementsByClassName('tweet-poll')[0];
    pollElement.innerHTML = '';
    let poll = tweet.card.binding_values;
    let choices = Object.keys(poll).filter(key => key.endsWith('label')).map((key, i) => ({
        label: poll[key].string_value,
        count: poll[key.replace('label', 'count')] ? +poll[key.replace('label', 'count')].string_value : 0,
        id: i+1
    }));
    let voteCount = choices.reduce((acc, cur) => acc + cur.count, 0);
    if(poll.selected_choice || user.id_str === tweet.user.id_str || (poll.counts_are_final && poll.counts_are_final.boolean_value)) {
        for(let i in choices) {
            let choice = choices[i];
            if(user.id_str !== tweet.user.id_str && poll.selected_choice && choice.id === +poll.selected_choice.string_value) {
                choice.selected = true;
            }
            choice.percentage = Math.round(choice.count / voteCount * 100);
            let choiceElement = document.createElement('div');
            choiceElement.classList.add('choice');
            choiceElement.innerHTML = `
                <div class="choice-bg" style="width:${choice.percentage}%" data-percentage="${choice.percentage}"></div>
                <div class="choice-label">
                    <span>${escapeHTML(choice.label)}</span>
                    ${choice.selected ? `<span class="choice-selected"></span>` : ''}
                </div>
                ${isFinite(choice.percentage) ? `<div class="choice-count">${choice.count} (${choice.percentage}%)</div>` : '<div class="choice-count">0</div>'}
            `;
            pollElement.append(choiceElement);
        }
    } else {
        for(let i in choices) {
            let choice = choices[i];
            let choiceElement = document.createElement('div');
            choiceElement.classList.add('choice', 'choice-unselected');
            choiceElement.innerHTML = `
                <div class="choice-bg" style="width:100%"></div>
                <div class="choice-label">${escapeHTML(choice.label)}</div>
            `;
            choiceElement.addEventListener('click', async () => {
                let newCard = await API.pollVote(poll.api.string_value, tweet.id_str, tweet.card.url, tweet.card.name, choice.id);
                tweet.card = newCard.card;
                generateCard(tweet, tweetElement, user);
            });
            pollElement.append(choiceElement);
        }
    }
    if(tweet.card.url.startsWith('card://')) {
        let footer = document.createElement('span');
        footer.classList.add('poll-footer');
        footer.innerHTML = `${voteCount} vote${voteCount === 1 ? '' : 's'}${(!poll.counts_are_final || !poll.counts_are_final.boolean_value) && poll.end_datetime_utc ? ` ・ Ends at ${new Date(poll.end_datetime_utc.string_value).toLocaleString()}` : ''}`;
        pollElement.append(footer);
    }
}
function generateCard(tweet, tweetElement, user) {
    if(!tweet.card) return;
    if(tweet.card.name === 'promo_image_convo') {
        let vals = tweet.card.binding_values;
        let a = document.createElement('a');
        a.href = vals.thank_you_url.string_value;
        a.target = '_blank';
        a.title = vals.thank_you_text.string_value;
        let img = document.createElement('img');
        img.src = vals.promo_image.image_value.url;
        img.width = sizeFunctions[1](vals.promo_image.image_value.width, vals.promo_image.image_value.height)[0];
        img.height = sizeFunctions[1](vals.promo_image.image_value.width, vals.promo_image.image_value.height)[1];
        img.className = 'tweet-media-element';
        a.append(img);
        tweetElement.getElementsByClassName('tweet-poll')[0].append(a);
    } else if(tweet.card.url.startsWith('card://')) {
        generatePoll(tweet, tweetElement, user);
    } else if(tweet.card.name === "player") {
        let iframe = document.createElement('iframe');
        iframe.src = tweet.card.binding_values.player_url.string_value;
        iframe.classList.add('tweet-player');
        iframe.width = 450;
        iframe.height = 250;
        tweetElement.getElementsByClassName('tweet-poll')[0].innerHTML = '';
        tweetElement.getElementsByClassName('tweet-poll')[0].append(iframe);
    }
}

function luminance(r, g, b) {
    var a = [r, g, b].map(function(v) {
      v /= 255;
      return v <= 0.03928 ?
        v / 12.92 :
        Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}
function contrast(rgb1, rgb2) {
    var lum1 = luminance(rgb1[0], rgb1[1], rgb1[2]);
    var lum2 = luminance(rgb2[0], rgb2[1], rgb2[2]);
    var brightest = Math.max(lum1, lum2);
    var darkest = Math.min(lum1, lum2);
    return (brightest + 0.05) /
      (darkest + 0.05);
}
const hex2rgb = (hex) => {
      if(!hex.startsWith('#')) hex = `#${hex}`;
      const r = parseInt(hex.slice(1, 3), 16)
      const g = parseInt(hex.slice(3, 5), 16)
      const b = parseInt(hex.slice(5, 7), 16)
      // return {r, g, b} // return an object
      return [ r, g, b ]
}

function isProfilePath(path) {
    path = path.split('?')[0].split('#')[0];
    if(path.endsWith('/')) path = path.slice(0, -1);
    if(path.split('/').length > 2) return false;
    if(['/home', '/notifications', '/messages', '/settings', '/explore', '/login', '/register', '/signin', '/signup', '/logout', '/i', '/old', '/search'].includes(path)) return false;
    return true;
}
  
const colorShade = (col, amt) => {
    col = col.replace(/^#/, '')
    if (col.length === 3) col = col[0] + col[0] + col[1] + col[1] + col[2] + col[2]
  
    let [r, g, b] = col.match(/.{2}/g);
    ([r, g, b] = [parseInt(r, 16) + amt, parseInt(g, 16) + amt, parseInt(b, 16) + amt])
  
    r = Math.max(Math.min(255, r), 0).toString(16)
    g = Math.max(Math.min(255, g), 0).toString(16)
    b = Math.max(Math.min(255, b), 0).toString(16)
  
    const rr = (r.length < 2 ? '0' : '') + r
    const gg = (g.length < 2 ? '0' : '') + g
    const bb = (b.length < 2 ? '0' : '') + b
  
    return `#${rr}${gg}${bb}`
}
const mediaClasses = [
    undefined,
    'tweet-media-element-one',
    'tweet-media-element-two',
    'tweet-media-element-three',
    'tweet-media-element-four',
];
const sizeFunctions = [
    undefined,
    (w, h) => [w > 450 ? 450 : w, h > 500 ? 500 : h],
    (w, h) => [w > 200 ? 200 : w, h > 400 ? 400 : h],
    (w, h) => [w > 150 ? 150 : w, h > 250 ? 250 : h],
    (w, h) => [w > 100 ? 100 : w, h > 150 ? 150 : h],
];
const quoteSizeFunctions = [
    undefined,
    (w, h) => [w > 400 ? 400 : w, h > 400 ? 400 : h],
    (w, h) => [w > 200 ? 200 : w, h > 400 ? 400 : h],
    (w, h) => [w > 125 ? 125 : w, h > 200 ? 200 : h],
    (w, h) => [w > 100 ? 100 : w, h > 150 ? 150 : h],
];

async function renderTrends(compact = false) {
    let trends = (await API.getTrends()).modules;
    let trendsContainer = document.getElementById('trends-list');
    trendsContainer.innerHTML = '';
    trends.forEach(({ trend }) => {
        let trendDiv = document.createElement('div');
        trendDiv.className = 'trend';
        trendDiv.innerHTML = compact ? `<a href="https://twitter.com/search?q=${escapeHTML(trend.name)}" class="trend-name">${escapeHTML(trend.name)}</a>` : `
            <b><a href="https://twitter.com/search?q=${escapeHTML(trend.name)}" class="trend-name">${escapeHTML(trend.name)}</a></b><br>
            <span class="trend-description">${trend.meta_description ? escapeHTML(trend.meta_description) : ''}</span>
        `;
        trendsContainer.append(trendDiv);
        if(vars.enableTwemoji) twemoji.parse(trendDiv);
    });
}
async function renderDiscovery(cache = true) {
    let discover = await API.discoverPeople(cache);
    let discoverContainer = document.getElementById('wtf-list');
    discoverContainer.innerHTML = '';
    try {
        let usersData = discover.globalObjects.users;
        let max = 7;
        if(innerHeight < 650) max = 5;
        let usersSuggestions = discover.timeline.instructions[0].addEntries.entries[0].content.timelineModule.items.map(s => s.entryId.slice('user-'.length)).slice(0, max); // why is it so deep
        usersSuggestions.forEach(userId => {
            let userData = usersData[userId];
            if (!userData) return;
            let udiv = document.createElement('div');
            udiv.className = 'wtf-user';
            udiv.innerHTML = `
                <a class="tweet-avatar-link" href="https://twitter.com/${userData.screen_name}"><img src="${userData.profile_image_url_https.replace("_normal", "_bigger")}" alt="${escapeHTML(userData.name)}" class="tweet-avatar" width="48" height="48"></a>
                <div class="tweet-header wtf-header">
                    <a class="tweet-header-info wtf-user-link" href="https://twitter.com/${userData.screen_name}">
                        <b class="tweet-header-name wtf-user-name">${escapeHTML(userData.name)}</b>
                        <span class="tweet-header-handle wtf-user-handle">@${userData.screen_name}</span>
                    </a>
                    <br>
                    <button class="nice-button discover-follow-btn ${userData.following ? 'following' : 'follow'}" style="position:relative;bottom: 1px;">${userData.following ? 'Following' : 'Follow'}</button>
                </div>
            `;
            const followBtn = udiv.querySelector('.discover-follow-btn');
            followBtn.addEventListener('click', async () => {
                if (followBtn.className.includes('following')) {
                    await API.unfollowUser(userData.screen_name);
                    followBtn.classList.remove('following');
                    followBtn.classList.add('follow');
                    followBtn.innerText = 'Follow';
                    userData.following = false;
                } else {
                    await API.followUser(userData.screen_name);
                    followBtn.classList.add('following');
                    followBtn.classList.remove('follow');
                    followBtn.innerText = 'Following';
                    userData.following = true;
                }
                chrome.storage.local.set({
                    discoverData: {
                        date: Date.now(),
                        data: discover
                    }
                }, () => { })
            });
            discoverContainer.append(udiv);
            if(vars.enableTwemoji) twemoji.parse(udiv);
        });
    } catch (e) {
        console.warn(e);
    }
}
async function appendTweet(t, timelineContainer, options = {}) {
    if(typeof seenReplies !== 'undefined') {
        if(seenReplies.includes(t.id_str)) return;
        seenReplies.push(t.id_str);
    }
    if(typeof seenThreads !== 'undefined') {
        if(seenThreads.includes(t.id_str)) return;
    }
    if(typeof tweets !== 'undefined') tweets.push(['tweet', t, options]);
    const tweet = document.createElement('div');
    if(!options.mainTweet && typeof mainTweetLikers !== 'undefined') {
        tweet.addEventListener('click', async e => {
            if(e.target.className.startsWith('tweet tweet-id-') || e.target.className === 'tweet-body' || e.target.className === 'tweet-interact') {
                document.getElementById('loading-box').hidden = false;
                savePageData();
                history.pushState({}, null, `https://twitter.com/${t.user.screen_name}/status/${t.id_str}`);
                updateSubpage();
                mediaToUpload = [];
                linkColors = {};
                cursor = undefined;
                seenReplies = [];
                mainTweetLikers = [];
                let restored = await restorePageData();
                let id = location.pathname.match(/status\/(\d{1,32})/)[1];
                if(subpage === 'tweet' && !restored) {
                    updateReplies(id);
                } else if(subpage === 'likes') {
                    updateLikes(id);
                } else if(subpage === 'retweets') {
                    updateRetweets(id);
                } else if(subpage === 'retweets_with_comments') {
                    updateRetweetsWithComments(id);
                }
                renderDiscovery();
                renderTrends();
                currentLocation = location.pathname;
            }
        });
        tweet.addEventListener('mousedown', e => {
            if(e.button === 1) {
                e.preventDefault();
                if(e.target.className.startsWith('tweet tweet-id-') || e.target.className === 'tweet-body' || e.target.className === 'tweet-interact') {
                    openInNewTab(`https://twitter.com/${t.user.screen_name}/status/${t.id_str}`);
                }
            }
        });
    } else {
        tweet.addEventListener('click', e => {
            if(e.target.className.startsWith('tweet tweet-id-') || e.target.className === 'tweet-body' || e.target.className === 'tweet-interact') {
                let tweet = t;
                if(tweet.retweeted_status) tweet = tweet.retweeted_status;
                new TweetViewer(user, settings, tweet);
            }
        });
        tweet.addEventListener('mousedown', e => {
            if(e.button === 1) {
                e.preventDefault();
                if(e.target.className.startsWith('tweet tweet-id-') || e.target.className === 'tweet-body' || e.target.className === 'tweet-interact') {
                    openInNewTab(`https://twitter.com/${t.user.screen_name}/status/${t.id_str}`);
                }
            }
        });
    }
    tweet.tabIndex = -1;
    tweet.className = `tweet tweet-id-${t.id_str} ${options.mainTweet ? 'tweet-main' : 'tweet-replying'}`;
    try {
        if(!activeTweet) {
            tweet.classList.add('tweet-active');
            activeTweet = tweet;
        }
    } catch(e) {}
    if (options.threadContinuation) tweet.classList.add('tweet-self-thread-continuation');
    if (options.selfThreadContinuation) tweet.classList.add('tweet-self-thread-continuation');

    if (options.noTop) tweet.classList.add('tweet-no-top');
    if(vars.linkColorsInTL && typeof linkColors !== 'undefined') {
        if(linkColors[t.user.screen_name]) {
            let rgb = hex2rgb(linkColors[t.user.screen_name]);
            let ratio = contrast(rgb, [27, 40, 54]);
            if(ratio < 4 && vars.darkMode && linkColors[t.user.screen_name] !== '000000') {
                linkColors[t.user.screen_name] = colorShade(linkColors[t.user.screen_name], 80).slice(1);
            }
            tweet.style.setProperty('--link-color', '#'+linkColors[t.user.screen_name]);
        } else {
            if(t.user.profile_link_color && t.user.profile_link_color !== '1DA1F2') {
                let rgb = hex2rgb(t.user.profile_link_color);
                let ratio = contrast(rgb, [27, 40, 54]);
                if(ratio < 4 && vars.darkMode && linkColors[t.user.screen_name] !== '000000') {
                    t.user.profile_link_color = colorShade(t.user.profile_link_color, 80).slice(1);
                }
                tweet.style.setProperty('--link-color', '#'+t.user.profile_link_color);
            }
        }
    }
    t.full_text = t.full_text.replace(/^((?<!\w)@([\w+]{1,15})\s)+/, '')
    let textWithoutLinks = t.full_text.replace(/(?:https?|ftp):\/\/[\n\S]+/g, '').replace(/(?<!\w)@([\w+]{1,15}\b)/g, '');
    let isEnglish = textWithoutLinks.length < 1 ? {languages:[{language:'en', percentage:100}]} : await chrome.i18n.detectLanguage(textWithoutLinks);
    isEnglish = isEnglish.languages[0] && isEnglish.languages[0].percentage > 60 && isEnglish.languages[0].language.startsWith('en');
    let hasVideo = t.extended_entities && t.extended_entities.media && t.extended_entities.media.some(m => m.type === 'video');
    if(hasVideo) {
        t.extended_entities.media[0].video_info.variants = t.extended_entities.media[0].video_info.variants.sort((a, b) => {
            if(!b.bitrate) return -1;
            return b.bitrate-a.bitrate;
        });
        if(typeof(vars.savePreferredQuality) !== 'boolean') {
            chrome.storage.sync.set({
                savePreferredQuality: true
            }, () => {});
            vars.savePreferredQuality = true;
        }
        if(localStorage.preferredQuality && vars.savePreferredQuality) {
            let closestQuality = t.extended_entities.media[0].video_info.variants.filter(v => v.bitrate).reduce((prev, curr) => {
                return (Math.abs(parseInt(curr.url.match(/\/(\d+)x/)[1]) - parseInt(localStorage.preferredQuality)) < Math.abs(parseInt(prev.url.match(/\/(\d+)x/)[1]) - parseInt(localStorage.preferredQuality)) ? curr : prev);
            });
            let preferredQualityVariantIndex = t.extended_entities.media[0].video_info.variants.findIndex(v => v.url === closestQuality.url);
            if(preferredQualityVariantIndex !== -1) {
                let preferredQualityVariant = t.extended_entities.media[0].video_info.variants[preferredQualityVariantIndex];
                t.extended_entities.media[0].video_info.variants.splice(preferredQualityVariantIndex, 1);
                t.extended_entities.media[0].video_info.variants.unshift(preferredQualityVariant);
            }
        }
    }
    tweet.innerHTML = /*html*/`
        <div class="tweet-top" hidden></div>
        <a class="tweet-avatar-link" href="https://twitter.com/${t.user.screen_name}"><img onerror="this.src = 'https://abs.twimg.com/sticky/default_profile_images/default_profile_bigger.png'" src="${t.user.profile_image_url_https.replace("_normal.", "_bigger.")}" alt="${t.user.name}" class="tweet-avatar" width="48" height="48"></a>
        <div class="tweet-header ${options.mainTweet ? 'tweet-header-main' : ''}">
            <a class="tweet-header-info ${options.mainTweet ? 'tweet-header-info-main' : ''}" href="https://twitter.com/${t.user.screen_name}">
                <b class="tweet-header-name ${options.mainTweet ? 'tweet-header-name-main' : ''} ${t.user.verified || t.user.id_str === '1123203847776763904' ? 'user-verified' : ''} ${t.user.protected ? 'user-protected' : ''}">${escapeHTML(t.user.name)}</b>
                <span class="tweet-header-handle">@${t.user.screen_name}</span>
            </a>
            ${location.pathname.split("?")[0].split("#")[0] === '/i/bookmarks' ? '<span class="tweet-delete-bookmark">&times;</span>' : ''}
            ${options.mainTweet && t.user.id_str !== user.id_str ? `<button class='nice-button tweet-header-follow ${t.user.following ? 'following' : 'follow'}'>${t.user.following ? 'Following' : 'Follow'}</button>` : ''}
        </div>
        <a ${options.mainTweet ? 'hidden' : ''} class="tweet-time" data-timestamp="${new Date(t.created_at).getTime()}" title="${new Date(t.created_at).toLocaleString()}" href="https://twitter.com/${t.user.screen_name}/status/${t.id_str}">${timeElapsed(new Date(t.created_at).getTime())}</a>
        <div class="tweet-body ${options.mainTweet ? 'tweet-body-main' : ''}">
            <span class="tweet-body-text ${(t.full_text && t.full_text.length > 100) || !options.mainTweet ? 'tweet-body-text-long' : 'tweet-body-text-short'}">${t.full_text ? escapeHTML(t.full_text).replace(/\n/g, '<br>').replace(/((http|https|ftp):\/\/[\w?=.\/-;#~%-]+(?![\w\s?&.\/;#~%"=-]*>))/g, '<a href="$1">$1</a>').replace(/(?<!\w)@([\w+]{1,15}\b)/g, `<a href="https://twitter.com/$1">@$1</a>`).replace(/(?<!\w)#([\w+]+\b)/g, `<a href="https://twitter.com/hashtag/$1">#$1</a>`) : ''}</span>
            ${!isEnglish ? `
            <br>
            <span class="tweet-translate">View translation</span>
            ` : ``}
            ${t.extended_entities && t.extended_entities.media ? `
                <div class="tweet-media">
                    ${t.extended_entities.media.map(m => `<${m.type === 'photo' ? 'img' : 'video'} ${m.ext_alt_text ? `alt="${escapeHTML(m.ext_alt_text)}" title="${escapeHTML(m.ext_alt_text)}"` : ''} crossorigin="anonymous" width="${sizeFunctions[t.extended_entities.media.length](m.original_info.width, m.original_info.height)[0]}" height="${sizeFunctions[t.extended_entities.media.length](m.original_info.width, m.original_info.height)[1]}" loading="lazy" ${m.type === 'video' ? 'controls' : ''} ${m.type === 'animated_gif' ? 'loop autoplay muted' : ''} ${m.type === 'photo' ? `src="${m.media_url_https}"` : ''} class="tweet-media-element ${mediaClasses[t.extended_entities.media.length]} ${!settings.display_sensitive_media && t.possibly_sensitive ? 'tweet-media-element-censor' : ''}">${m.type === 'video' || m.type === 'animated_gif' ? `
                        ${m.video_info.variants.map(v => `<source src="${v.url}" type="${v.content_type}">`).join('\n')}
                        Your browser does not support this video.
                    </video>` : ''}`).join('\n')}
                </div>
                ${hasVideo ? /*html*/`
                    <div class="tweet-media-controls">
                        ${t.extended_entities.media[0].ext && t.extended_entities.media[0].ext.r && t.extended_entities.media[0].ext.r.ok ? `<span class="tweet-video-views">${Number(t.extended_entities.media[0].ext.mediaStats.r.ok.viewCount).toLocaleString().replace(/\s/g, ',')} views</span> • ` : ''}<span class="tweet-video-reload">Reload</span> •
                        ${t.extended_entities.media[0].video_info.variants.filter(v => v.bitrate).map(v => `<span class="tweet-video-quality" data-url="${v.url}">${v.url.match(/\/(\d+)x/)[1] + 'p'}</span> `).join(" / ")}
                    </div>
                ` : ``}
            ` : ``}
            ${t.card ? `<div class="tweet-poll"></div>` : ''}
            ${t.quoted_status ? `
            <a class="tweet-body-quote" href="https://twitter.com/${t.quoted_status.user.screen_name}/status/${t.quoted_status.id_str}">
                <img src="${t.quoted_status.user.profile_image_url_https}" alt="${escapeHTML(t.quoted_status.user.name)}" class="tweet-avatar-quote" width="24" height="24">
                <div class="tweet-header-quote">
                    <span class="tweet-header-info-quote">
                    <b class="tweet-header-name-quote ${t.quoted_status.user.verified || t.quoted_status.user.id_str === '1123203847776763904' ? 'user-verified' : ''} ${t.quoted_status.user.protected ? 'user-protected' : ''}">${escapeHTML(t.quoted_status.user.name)}</b>
                    <span class="tweet-header-handle-quote">@${t.quoted_status.user.screen_name}</span>
                    </span>
                </div>
                <span class="tweet-time-quote" data-timestamp="${new Date(t.quoted_status.created_at).getTime()}" title="${new Date(t.quoted_status.created_at).toLocaleString()}">${timeElapsed(new Date(t.quoted_status.created_at).getTime())}</span>
                <span class="tweet-body-text-quote tweet-body-text-long" style="color:var(--default-text-color)!important">${t.quoted_status.full_text ? escapeHTML(t.quoted_status.full_text).replace(/\n/g, '<br>') : ''}</span>
                ${t.quoted_status.extended_entities && t.quoted_status.extended_entities.media ? `
                <div class="tweet-media-quote">
                    ${t.quoted_status.extended_entities.media.map(m => `<${m.type === 'photo' ? 'img' : 'video'} ${m.ext_alt_text ? `alt="${escapeHTML(m.ext_alt_text)}" title="${escapeHTML(m.ext_alt_text)}"` : ''} crossorigin="anonymous" width="${quoteSizeFunctions[t.quoted_status.extended_entities.media.length](m.original_info.width, m.original_info.height)[0]}" height="${quoteSizeFunctions[t.quoted_status.extended_entities.media.length](m.original_info.width, m.original_info.height)[1]}" loading="lazy" ${m.type === 'video' ? 'controls' : ''} ${m.type === 'animated_gif' ? 'loop autoplay muted' : ''} src="${m.type === 'photo' ? m.media_url_https : m.video_info.variants.find(v => v.content_type === 'video/mp4').url}" class="tweet-media-element tweet-media-element-quote ${mediaClasses[t.quoted_status.extended_entities.media.length]} ${!settings.display_sensitive_media && t.quoted_status.possibly_sensitive ? 'tweet-media-element-censor' : ''}">${m.type === 'video' ? '</video>' : ''}`).join('\n')}
                </div>
                ` : ''}
            </a>
            ` : ``}
            ${t.limited_actions === 'limit_trusted_friends_tweet' && (options.mainTweet || !location.pathname.includes('/status/')) ? `
            <div class="tweet-limited">
                This tweet is visible only to people who are in @${t.user.screen_name}'s trusted friends circle.<br>
                <a href="https://help.twitter.com/en/using-twitter/twitter-circle" target="_blank">Learn more.</a>
            </div>
            ` : ''}
            ${t.tombstone ? `<div class="tweet-warning">${t.tombstone}</div>` : ''}
            ${options.mainTweet ? /*html*/`
            <div class="tweet-footer">
                <div class="tweet-footer-stats">
                    <div class="tweet-footer-stat">
                        <span class="tweet-footer-stat-text">Replies</span>
                        <b class="tweet-footer-stat-count tweet-footer-stat-replies">${Number(t.reply_count).toLocaleString().replace(/\s/g, ',')}</b>
                    </div>
                    <a href="https://twitter.com/${t.user.screen_name}/status/${t.id_str}/retweets/with_comments" class="tweet-footer-stat tweet-footer-stat-r">
                        <span class="tweet-footer-stat-text">Retweets</span>
                        <b class="tweet-footer-stat-count tweet-footer-stat-retweets">${Number(t.retweet_count).toLocaleString().replace(/\s/g, ',')}</b>
                    </a>
                    <a href="https://twitter.com/${t.user.screen_name}/status/${t.id_str}/likes" class="tweet-footer-stat tweet-footer-stat-f">
                        <span class="tweet-footer-stat-text">Favorites</span>
                        <b class="tweet-footer-stat-count tweet-footer-stat-favorites">${Number(t.favorite_count).toLocaleString().replace(/\s/g, ',')}</b>
                    </a>
                </div>
                <div class="tweet-footer-favorites"></div>
            </div>
            ` : ''}
            <a ${!options.mainTweet ? 'hidden' : ''} class="tweet-date" title="${new Date(t.created_at).toLocaleString()}" href="https://twitter.com/${t.user.screen_name}/status/${t.id_str}"><br>${new Date(t.created_at).toLocaleTimeString(undefined, { hour: 'numeric', minute: 'numeric' }).toLowerCase()} - ${new Date(t.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}  ・ ${t.source.split('>')[1].split('<')[0]}</a>
            ${options.selfThreadButton && t.self_thread.id_str ? `<br><a class="tweet-self-thread-button" target="_blank" href="https://twitter.com/${t.user.screen_name}/status/${t.self_thread.id_str}">Show this thread</a>` : ``}
            <div class="tweet-interact">
                <span class="tweet-interact-reply" data-val="${t.reply_count}">${options.mainTweet ? '' : t.reply_count}</span>
                <span class="tweet-interact-retweet ${t.retweeted ? 'tweet-interact-retweeted' : ''}" data-val="${t.retweet_count}">${options.mainTweet ? '' : t.retweet_count}</span>
                <div class="tweet-interact-retweet-menu" hidden>
                    <span class="tweet-interact-retweet-menu-retweet">${t.retweeted ? 'Unretweet' : 'Retweet'}</span><br>
                    <span class="tweet-interact-retweet-menu-quote">Quote tweet</span><br>
                    ${options.mainTweet ? `
                        <span class="tweet-interact-retweet-menu-quotes">See quotes</span><br>
                        <span class="tweet-interact-retweet-menu-retweeters">See retweeters</span><br>
                    ` : ''}
                </div>
                <span class="tweet-interact-favorite ${t.favorited ? 'tweet-interact-favorited' : ''}" data-val="${t.favorite_count}">${options.mainTweet ? '' : t.favorite_count}</span>
                <span class="tweet-interact-more"></span>
                <div class="tweet-interact-more-menu" hidden>
                    <span class="tweet-interact-more-menu-copy">Copy link</span><br>
                    <span class="tweet-interact-more-menu-embed">Embed tweet</span><br>
                    <span class="tweet-interact-more-menu-share">Share tweet</span><br>
                    ${t.user.id_str === user.id_str ? /*html*/`
                    <hr>
                    <span class="tweet-interact-more-menu-analytics">Tweet analytics</span><br>
                    <span class="tweet-interact-more-menu-delete">Delete tweet</span><br>
                    ${typeof pageUser !== 'undefined' && pageUser.id_str === user.id_str ? /*html*/`<span class="tweet-interact-more-menu-pin">${pinnedTweet && pinnedTweet.id_str === t.id_str ? 'Unpin tweet' :  'Pin tweet'}</span><br>` : ''}
                    ` : ``}
                    ${t.user.id_str !== user.id_str && !options.mainTweet ? `
                    <hr>
                    <span class="tweet-interact-more-menu-follow">${t.user.following ? 'Unfollow' : 'Follow'} @${t.user.screen_name}</span><br>
                    ` : ''}
                    <span class="tweet-interact-more-menu-bookmark">Bookmark tweet</span>
                    <hr>
                    ${t.feedback ? t.feedback.map((f, i) => `<span class="tweet-interact-more-menu-feedback" data-index="${i}">${f.prompt ? f.prompt : "Not interested in topic"}</span><br>`).join("\n") : ''}
                    <span class="tweet-interact-more-menu-refresh">Refresh tweet data</span><br>
                    ${t.extended_entities && t.extended_entities.media.length === 1 ? `<span class="tweet-interact-more-menu-download">Download media</span><br>` : ``}
                    ${t.extended_entities && t.extended_entities.media.length === 1 && t.extended_entities.media[0].type === 'animated_gif' ? `<span class="tweet-interact-more-menu-download-gif">Download as GIF</span><br>` : ``}
                </div>
            </div>
            <div class="tweet-reply" hidden>
                <br>
                <b style="font-size: 12px;display: block;margin-bottom: 5px;">Replying to tweet <span class="tweet-reply-upload">[upload media]</span> <span class="tweet-reply-cancel">[cancel]</span></b>
                <span class="tweet-reply-error" style="color:red"></span>
                <textarea maxlength="280" class="tweet-reply-text" placeholder="Cool reply tweet"></textarea>
                <button class="tweet-reply-button nice-button">Reply</button><br>
                <span class="tweet-reply-char">0/280</span><br>
                <div class="tweet-reply-media" style="padding-bottom: 10px;"></div>
            </div>
            <div class="tweet-quote" hidden>
                <br>
                <b style="font-size: 12px;display: block;margin-bottom: 5px;">Quote tweet <span class="tweet-quote-upload">[upload media]</span> <span class="tweet-quote-cancel">[cancel]</span></b>
                <span class="tweet-quote-error" style="color:red"></span>
                <textarea maxlength="280" class="tweet-quote-text" placeholder="Cool quote tweet"></textarea>
                <button class="tweet-quote-button nice-button">Quote</button><br>
                <span class="tweet-quote-char">0/280</span><br>
                <div class="tweet-quote-media" style="padding-bottom: 10px;"></div>
            </div>
            <div class="tweet-self-thread-div" ${(options.threadContinuation || (options.selfThreadContinuation && t.self_thread.id_str)) ? '' : 'hidden'}>
                <span class="tweet-self-thread-line"></span>
                <div class="tweet-self-thread-line-dots"></div>
                <br>${options.selfThreadContinuation && t.self_thread.id_str ? `<a class="tweet-self-thread-button" href="https://twitter.com/${t.user.screen_name}/status/${t.self_thread.id_str}">Show this thread</a>` : `<br>`}
            </div>
        </div>
    `;
    // video
    if(hasVideo) {
        let vid = tweet.getElementsByClassName('tweet-media')[0].children[0];
        vid.onloadstart = () => {
            let src = vid.currentSrc;
            Array.from(tweet.getElementsByClassName('tweet-video-quality')).forEach(el => {
                if(el.dataset.url === src) el.classList.add('tweet-video-quality-current');
            });
            tweet.getElementsByClassName('tweet-video-reload')[0].addEventListener('click', () => {
                tweet.getElementsByClassName('tweet-media')[0].innerHTML = /*html*/`
                    ${t.extended_entities.media.map(m => `<${m.type === 'photo' ? 'img' : 'video'} ${m.ext_alt_text ? `alt="${escapeHTML(m.ext_alt_text)}" title="${escapeHTML(m.ext_alt_text)}"` : ''} crossorigin="anonymous" width="${sizeFunctions[t.extended_entities.media.length](m.original_info.width, m.original_info.height)[0]}" height="${sizeFunctions[t.extended_entities.media.length](m.original_info.width, m.original_info.height)[1]}" loading="lazy" ${m.type === 'video' ? 'controls' : ''} ${m.type === 'animated_gif' ? 'loop autoplay muted' : ''} ${m.type === 'photo' ? `src="${m.media_url_https}"` : ''} class="tweet-media-element ${mediaClasses[t.extended_entities.media.length]} ${!settings.display_sensitive_media && t.possibly_sensitive ? 'tweet-media-element-censor' : ''}">${m.type === 'video' || m.type === 'animated_gif' ? `
                        ${m.video_info.variants.map(v => `<source src="${v.url}" type="${v.content_type}">`).join('\n')}
                        Your browser does not support this video.
                    </video>` : ''}`).join('\n')}
                `;
                let vid = tweet.getElementsByClassName('tweet-media')[0].children[0];
                vid.onloadstart = () => {
                    let src = vid.currentSrc;
                    Array.from(tweet.getElementsByClassName('tweet-video-quality')).forEach(el => {
                        if(el.dataset.url === src) el.classList.add('tweet-video-quality-current');
                        else el.classList.remove('tweet-video-quality-current');
                    });
                }
            });
            Array.from(tweet.getElementsByClassName('tweet-video-quality')).forEach(el => el.addEventListener('click', () => {
                if(el.className.includes('tweet-video-quality-current')) return;
                let url = el.getAttribute('data-url');
                localStorage.preferredQuality = parseInt(el.innerText);
                tweet.getElementsByClassName('tweet-media')[0].innerHTML = /*html*/`
                    ${t.extended_entities.media.map(m => `<${m.type === 'photo' ? 'img' : 'video'} ${m.ext_alt_text ? `alt="${escapeHTML(m.ext_alt_text)}" title="${escapeHTML(m.ext_alt_text)}"` : ''} crossorigin="anonymous" width="${sizeFunctions[t.extended_entities.media.length](m.original_info.width, m.original_info.height)[0]}" height="${sizeFunctions[t.extended_entities.media.length](m.original_info.width, m.original_info.height)[1]}" loading="lazy" ${m.type === 'video' ? 'controls' : ''} ${m.type === 'animated_gif' ? 'loop autoplay muted' : ''} ${m.type === 'photo' ? `src="${m.media_url_https}"` : ''} class="tweet-media-element ${mediaClasses[t.extended_entities.media.length]} ${!settings.display_sensitive_media && t.possibly_sensitive ? 'tweet-media-element-censor' : ''}">${m.type === 'video' || m.type === 'animated_gif' ? `
                        ${m.video_info.variants.filter(v => v.url === url).map(v => `<source src="${v.url}" type="${v.content_type}">`).join('\n')}
                        Your browser does not support this video.
                    </video>` : ''}`).join('\n')}
                `;
                let vid = tweet.getElementsByClassName('tweet-media')[0].children[0];
                vid.onloadstart = () => {
                    let src = vid.currentSrc;
                    Array.from(tweet.getElementsByClassName('tweet-video-quality')).forEach(el => {
                        if(el.dataset.url === src) el.classList.add('tweet-video-quality-current');
                        else el.classList.remove('tweet-video-quality-current');
                    });
                }
            }));
        };
    }

    let footerFavorites = tweet.getElementsByClassName('tweet-footer-favorites')[0];
    if(t.card) {
        generateCard(t, tweet, user);
    }
    if (options.top) {
        tweet.querySelector('.tweet-top').hidden = false;
        const icon = document.createElement('span');
        icon.innerText = options.top.icon;
        icon.classList.add('tweet-top-icon');
        icon.style.color = options.top.color;

        const span = document.createElement("span");
        span.classList.add("tweet-top-text");
        span.innerHTML = options.top.text;
        tweet.querySelector('.tweet-top').append(icon, span);
    }
    if(options.mainTweet) {
        let likers = mainTweetLikers.slice(0, 8);
        for(let i in likers) {
            let liker = likers[i];
            let a = document.createElement('a');
            a.href = `https://twitter.com/${liker.screen_name}`;
            let likerImg = document.createElement('img');
            likerImg.src = liker.profile_image_url_https;
            likerImg.classList.add('tweet-footer-favorites-img');
            likerImg.title = liker.name + ' (@' + liker.screen_name + ')';
            likerImg.width = 24;
            likerImg.height = 24;
            a.dataset.id = liker.id_str;
            a.appendChild(likerImg);
            footerFavorites.appendChild(a);
        }
        let likesLink = tweet.getElementsByClassName('tweet-footer-stat-f')[0];
        likesLink.addEventListener('click', e => {
            e.preventDefault();
            document.getElementById('loading-box').hidden = false;
            history.pushState({}, null, `https://twitter.com/${t.user.screen_name}/status/${t.id_str}/likes`);
            updateSubpage();
            mediaToUpload = [];
            linkColors = {};
            cursor = undefined;
            seenReplies = [];
            mainTweetLikers = [];
            let id = location.pathname.match(/status\/(\d{1,32})/)[1];
            updateLikes(id);
            renderDiscovery();
            renderTrends();
            currentLocation = location.pathname;
        });
        let retweetsLink = tweet.getElementsByClassName('tweet-footer-stat-r')[0];
        retweetsLink.addEventListener('click', e => {
            e.preventDefault();
            document.getElementById('loading-box').hidden = false;
            history.pushState({}, null, `https://twitter.com/${t.user.screen_name}/status/${t.id_str}/retweets/with_comments`);
            updateSubpage();
            mediaToUpload = [];
            linkColors = {};
            cursor = undefined;
            seenReplies = [];
            mainTweetLikers = [];
            let id = location.pathname.match(/status\/(\d{1,32})/)[1];
            updateRetweetsWithComments(id);
            renderDiscovery();
            renderTrends();
            currentLocation = location.pathname;
        });
    }
    if(options.mainTweet && t.user.id_str !== user.id_str) {
        const tweetFollow = tweet.getElementsByClassName('tweet-header-follow')[0];
        tweetFollow.addEventListener('click', async () => {
            if(t.user.following) {
                await API.unfollowUser(t.user.screen_name);
                tweetFollow.innerText = 'Follow';
                tweetFollow.classList.remove('following');
                tweetFollow.classList.add('follow');
                t.user.following = false;
            } else {
                await API.followUser(t.user.screen_name);
                tweetFollow.innerText = 'Unfollow';
                tweetFollow.classList.remove('follow');
                tweetFollow.classList.add('following');
                t.user.following = true;
            }
        });
    }
    const tweetBodyText = tweet.getElementsByClassName('tweet-body-text')[0];
    const tweetTranslate = tweet.getElementsByClassName('tweet-translate')[0];
    const tweetBodyQuote = tweet.getElementsByClassName('tweet-body-quote')[0];
    const tweetDeleteBookmark = tweet.getElementsByClassName('tweet-delete-bookmark')[0];

    const tweetReplyCancel = tweet.getElementsByClassName('tweet-reply-cancel')[0];
    const tweetReplyUpload = tweet.getElementsByClassName('tweet-reply-upload')[0];
    const tweetReply = tweet.getElementsByClassName('tweet-reply')[0];
    const tweetReplyButton = tweet.getElementsByClassName('tweet-reply-button')[0];
    const tweetReplyError = tweet.getElementsByClassName('tweet-reply-error')[0];
    const tweetReplyText = tweet.getElementsByClassName('tweet-reply-text')[0];
    const tweetReplyChar = tweet.getElementsByClassName('tweet-reply-char')[0];
    const tweetReplyMedia = tweet.getElementsByClassName('tweet-reply-media')[0];

    const tweetInteractReply = tweet.getElementsByClassName('tweet-interact-reply')[0];
    const tweetInteractRetweet = tweet.getElementsByClassName('tweet-interact-retweet')[0];
    const tweetInteractFavorite = tweet.getElementsByClassName('tweet-interact-favorite')[0];
    const tweetInteractMore = tweet.getElementsByClassName('tweet-interact-more')[0];

    const tweetFooterReplies = tweet.getElementsByClassName('tweet-footer-stat-replies')[0];
    const tweetFooterRetweets = tweet.getElementsByClassName('tweet-footer-stat-retweets')[0];
    const tweetFooterFavorites = tweet.getElementsByClassName('tweet-footer-stat-favorites')[0];

    const tweetQuote = tweet.getElementsByClassName('tweet-quote')[0];
    const tweetQuoteCancel = tweet.getElementsByClassName('tweet-quote-cancel')[0];
    const tweetQuoteUpload = tweet.getElementsByClassName('tweet-quote-upload')[0];
    const tweetQuoteButton = tweet.getElementsByClassName('tweet-quote-button')[0];
    const tweetQuoteError = tweet.getElementsByClassName('tweet-quote-error')[0];
    const tweetQuoteText = tweet.getElementsByClassName('tweet-quote-text')[0];
    const tweetQuoteChar = tweet.getElementsByClassName('tweet-quote-char')[0];
    const tweetQuoteMedia = tweet.getElementsByClassName('tweet-quote-media')[0];

    const tweetInteractRetweetMenu = tweet.getElementsByClassName('tweet-interact-retweet-menu')[0];
    const tweetInteractRetweetMenuRetweet = tweet.getElementsByClassName('tweet-interact-retweet-menu-retweet')[0];
    const tweetInteractRetweetMenuQuote = tweet.getElementsByClassName('tweet-interact-retweet-menu-quote')[0];
    const tweetInteractRetweetMenuQuotes = tweet.getElementsByClassName('tweet-interact-retweet-menu-quotes')[0];
    const tweetInteractRetweetMenuRetweeters = tweet.getElementsByClassName('tweet-interact-retweet-menu-retweeters')[0];

    const tweetInteractMoreMenu = tweet.getElementsByClassName('tweet-interact-more-menu')[0];
    const tweetInteractMoreMenuCopy = tweet.getElementsByClassName('tweet-interact-more-menu-copy')[0];
    const tweetInteractMoreMenuEmbed = tweet.getElementsByClassName('tweet-interact-more-menu-embed')[0];
    const tweetInteractMoreMenuShare = tweet.getElementsByClassName('tweet-interact-more-menu-share')[0];
    const tweetInteractMoreMenuAnalytics = tweet.getElementsByClassName('tweet-interact-more-menu-analytics')[0];
    const tweetInteractMoreMenuRefresh = tweet.getElementsByClassName('tweet-interact-more-menu-refresh')[0];
    const tweetInteractMoreMenuDownload = tweet.getElementsByClassName('tweet-interact-more-menu-download')[0];
    const tweetInteractMoreMenuDownloadGif = tweet.getElementsByClassName('tweet-interact-more-menu-download-gif')[0];
    const tweetInteractMoreMenuDelete = tweet.getElementsByClassName('tweet-interact-more-menu-delete')[0];
    const tweetInteractMoreMenuPin = tweet.getElementsByClassName('tweet-interact-more-menu-pin')[0];
    const tweetInteractMoreMenuFollow = tweet.getElementsByClassName('tweet-interact-more-menu-follow')[0];
    const tweetInteractMoreMenuBookmark = tweet.getElementsByClassName('tweet-interact-more-menu-bookmark')[0];
    const tweetInteractMoreMenuFeedbacks = Array.from(tweet.getElementsByClassName('tweet-interact-more-menu-feedback'));

    if(tweetBodyQuote && typeof mainTweetLikers !== 'undefined') {
        tweetBodyQuote.addEventListener('click', e => {
            e.preventDefault();
            document.getElementById('loading-box').hidden = false;
            history.pushState({}, null, `https://twitter.com/${t.quoted_status.user.screen_name}/status/${t.quoted_status.id_str}`);
            updateSubpage();
            mediaToUpload = [];
            linkColors = {};
            cursor = undefined;
            seenReplies = [];
            mainTweetLikers = [];
            let id = location.pathname.match(/status\/(\d{1,32})/)[1];
            if(subpage === 'tweet') {
                updateReplies(id);
            } else if(subpage === 'likes') {
                updateLikes(id);
            } else if(subpage === 'retweets') {
                updateRetweets(id);
            } else if(subpage === 'retweets_with_comments') {
                updateRetweetsWithComments(id);
            }
            renderDiscovery();
            renderTrends();
            currentLocation = location.pathname;
        });
    }

    // Translate
    if(tweetTranslate) tweetTranslate.addEventListener('click', async () => {
        let translated = await API.translateTweet(t.id_str);
        tweetTranslate.hidden = true;
        tweetBodyText.innerHTML += `<br>
        <span style="font-size: 12px;color: var(--light-gray);">Translated from [${translated.translated_lang}]:</span>
        <br>
        <span>${escapeHTML(translated.text)}</span>`;
        if(vars.enableTwemoji) twemoji.parse(tweetBodyText);
    });

    // Bookmarks
    if(tweetInteractMoreMenuBookmark) tweetInteractMoreMenuBookmark.addEventListener('click', async () => {
        API.createBookmark(t.id_str);
    });
    if(tweetDeleteBookmark) tweetDeleteBookmark.addEventListener('click', async () => {
        await API.deleteBookmark(t.id_str);
        tweet.remove();
        if(timelineContainer.children.length === 0) {
            timelineContainer.innerHTML = '<div style="color:var(--light-gray)">Wow, such empty</div>';
            document.getElementById('delete-all').hidden = true;
        }
    });

    // Media
    if (t.extended_entities && t.extended_entities.media) {
        const tweetMedia = tweet.getElementsByClassName('tweet-media')[0];
        tweetMedia.addEventListener('click', e => {
            if (e.target.className.includes('tweet-media-element-censor')) {
                return e.target.classList.remove('tweet-media-element-censor');
            }
            if (e.target.tagName === 'IMG') {
                new Viewer(tweetMedia);
                e.target.click();
            }
        });
        if(typeof pageUser !== 'undefined') {
            let profileMediaDiv = document.getElementById('profile-media-div');
            if(!options || !options.top || !options.top.text || !options.top.text.includes('retweeted')) t.extended_entities.media.forEach(m => {
                if(profileMediaDiv.children.length >= 6) return;
                let ch = Array.from(profileMediaDiv.children);
                if(ch.find(c => c.src === m.media_url_https)) return;
                const media = document.createElement('img');
                media.classList.add('tweet-media-element', 'tweet-media-element-four', 'profile-media-preview');
                media.src = m.media_url_https;
                if(m.ext_alt_text) media.alt = m.ext_alt_text;
                media.addEventListener('click', () => {
                    let tweet = document.getElementsByClassName('tweet-id-' + t.id_str)[0];
                    tweet.scrollIntoView({behavior: 'smooth', block: 'center'});
                });
                profileMediaDiv.appendChild(media);
            });
        }
    }

    // Links
    if (tweetBodyText && tweetBodyText.lastChild && tweetBodyText.lastChild.href && tweetBodyText.lastChild.href.startsWith('https://t.co/')) {
        if (t.entities.urls && (t.entities.urls.length === 0 || t.entities.urls[t.entities.urls.length - 1].url !== tweetBodyText.lastChild.href)) {
            tweetBodyText.lastChild.remove();
        }
    }
    let links = Array.from(tweetBodyText.getElementsByTagName('a')).filter(a => a.href.startsWith('https://t.co/'));
    links.forEach(a => {
        let link = t.entities.urls && t.entities.urls.find(u => u.url === a.href);
        if (link) {
            a.innerText = link.display_url;
            a.href = link.expanded_url;
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
        } else {
            if(!vars.chronologicalTL) a.remove();
        }
    });

    // Reply
    tweetReplyCancel.addEventListener('click', () => {
        tweetReply.hidden = true;
        tweetInteractReply.classList.remove('tweet-interact-reply-clicked');
    });
    let replyMedia = [];
    tweetReply.addEventListener('drop', e => {
        handleDrop(e, replyMedia, tweetReplyMedia);
    });
    tweetReply.addEventListener('paste', event => {
        let items = (event.clipboardData || event.originalEvent.clipboardData).items;
        for (index in items) {
            let item = items[index];
            if (item.kind === 'file') {
                let file = item.getAsFile();
                handleFiles([file], replyMedia, tweetReplyMedia);
            }
        }
    });
    tweetReplyUpload.addEventListener('click', () => {
        getMedia(replyMedia, tweetReplyMedia);
        tweetReplyText.focus();
    });
    tweetInteractReply.addEventListener('click', () => {
        if(options.mainTweet) {
            document.getElementById('new-tweet').click();
            document.getElementById('new-tweet-text').focus();
            return;
        }
        if (!tweetQuote.hidden) tweetQuote.hidden = true;
        if (tweetReply.hidden) {
            tweetInteractReply.classList.add('tweet-interact-reply-clicked');
        } else {
            tweetInteractReply.classList.remove('tweet-interact-reply-clicked');
        }
        tweetReply.hidden = !tweetReply.hidden;
        setTimeout(() => {
            tweetReplyText.focus();
        })
    });
    tweetReplyText.addEventListener('keydown', e => {
        if (e.key === 'Enter' && e.ctrlKey) {
            tweetReplyButton.click();
        }
        tweetReplyChar.innerText = `${tweetReplyText.value.length}/280`;
        if(tweetReplyText.value.length > 265) {
            tweetReplyChar.style.color = "#c26363";
        } else {
            tweetReplyChar.style.color = "";
        }
    });
    tweetReplyText.addEventListener('keyup', e => {
        tweetReplyChar.innerText = `${tweetReplyText.value.length}/280`;
        if(tweetReplyText.value.length > 265) {
            tweetReplyChar.style.color = "#c26363";
        } else {
            tweetReplyChar.style.color = "";
        }
    });
    tweetReplyButton.addEventListener('click', async () => {
        tweetReplyError.innerHTML = '';
        let text = tweetReplyText.value;
        if (text.length === 0 && replyMedia.length === 0) return;
        tweetReplyButton.disabled = true;
        let uploadedMedia = [];
        for (let i in replyMedia) {
            let media = replyMedia[i];
            try {
                media.div.getElementsByClassName('new-tweet-media-img-progress')[0].hidden = false;
                let mediaId = await API.uploadMedia({
                    media_type: media.type,
                    media_category: media.category,
                    media: media.data,
                    alt: media.alt,
                    loadCallback: data => {
                        media.div.getElementsByClassName('new-tweet-media-img-progress')[0].innerText = `${data.text} (${data.progress}%)`;
                    }
                });
                uploadedMedia.push(mediaId);
            } catch (e) {
                media.div.getElementsByClassName('new-tweet-media-img-progress')[0].hidden = true;
                console.error(e);
                alert(e);
            }
        }
        let tweetObject = {
            status: text,
            in_reply_to_status_id: t.id_str,
            auto_populate_reply_metadata: true,
            batch_mode: 'off',
            exclude_reply_user_ids: '',
            cards_platform: 'Web-13',
            include_entities: 1,
            include_user_entities: 1,
            include_cards: 1,
            send_error_codes: 1,
            tweet_mode: 'extended',
            include_ext_alt_text: true,
            include_reply_count: true
        };
        if (uploadedMedia.length > 0) {
            tweetObject.media_ids = uploadedMedia.join(',');
        }
        let tweetData;
        try {
            tweetData = await API.postTweet(tweetObject)
        } catch (e) {
            tweetReplyError.innerHTML = (e && e.message ? e.message : e) + "<br>";
            tweetReplyButton.disabled = false;
            return;
        }
        if (!tweetData) {
            tweetReplyButton.disabled = false;
            tweetReplyError.innerHTML = "Error sending tweet<br>";
            return;
        }
        tweetReplyText.value = '';
        tweetReply.hidden = true;
        tweetInteractReply.classList.remove('tweet-interact-reply-clicked');
        if(!options.mainTweet) {
            tweetInteractReply.dataset.val = parseInt(tweetInteractReply.innerText) + 1;
            tweetInteractReply.innerText = parseInt(tweetInteractReply.innerText) + 1;
        } else {
            tweetFooterReplies.dataset.val = parseInt(tweetFooterReplies.innerText) + 1;
            tweetFooterReplies.innerText = parseInt(tweetFooterReplies.innerText) + 1;
        }
        tweetData._ARTIFICIAL = true;
        if(typeof timeline !== 'undefined') {
            timeline.data.unshift(tweetData);
        }
        if(tweet.getElementsByClassName('tweet-self-thread-div')[0]) tweet.getElementsByClassName('tweet-self-thread-div')[0].hidden = false;
        tweetReplyButton.disabled = false;
        tweetReplyMedia.innerHTML = [];
        replyMedia = [];
        appendTweet(tweetData, document.getElementById('timeline'), {
            noTop: true,
            after: tweet
        });
    });

    // Retweet / Quote Tweet
    let retweetClicked = false;
    tweetQuoteCancel.addEventListener('click', () => {
        tweetQuote.hidden = true;
    });
    tweetInteractRetweet.addEventListener('click', async () => {
        if (!tweetQuote.hidden) {
            tweetQuote.hidden = true;
            return;
        }
        if (tweetInteractRetweetMenu.hidden) {
            tweetInteractRetweetMenu.hidden = false;
        }
        if(retweetClicked) return;
        retweetClicked = true;
        setTimeout(() => {
            document.body.addEventListener('click', () => {
                retweetClicked = false;
                setTimeout(() => tweetInteractRetweetMenu.hidden = true, 50);
            }, { once: true });
        }, 50);
    });
    tweetInteractRetweetMenuRetweet.addEventListener('click', async () => {
        if (!t.retweeted) {
            let c = confirm("Are you sure you want to retweet this tweet?");
            if (!c) return;
            let tweetData;
            try {
                tweetData = await API.retweetTweet(t.id_str);
            } catch (e) {
                console.error(e);
                return;
            }
            if (!tweetData) {
                return;
            }
            tweetInteractRetweetMenuRetweet.innerText = 'Unretweet';
            tweetInteractRetweet.classList.add('tweet-interact-retweeted');
            t.retweeted = true;
            t.newTweetId = tweetData.id_str;
            if(!options.mainTweet) {
                tweetInteractRetweet.dataset.val = parseInt(tweetInteractRetweet.innerText) + 1;
                tweetInteractRetweet.innerText = parseInt(tweetInteractRetweet.innerText) + 1;
            } else {
                tweetFooterRetweets.innerText = Number(parseInt(tweetFooterRetweets.innerText.replace(/\s/g, '').replace(/,/g, '').replace(/\./g, '')) + 1).toLocaleString().replace(/\s/g, ',');
            }
        } else {
            let tweetData;
            try {
                tweetData = await API.deleteTweet(t.current_user_retweet ? t.current_user_retweet.id_str : t.newTweetId);
            } catch (e) {
                console.error(e);
                return;
            }
            if (!tweetData) {
                return;
            }
            tweetInteractRetweetMenuRetweet.innerText = 'Retweet';
            tweetInteractRetweet.classList.remove('tweet-interact-retweeted');
            t.retweeted = false;
            if(!options.mainTweet) {
                tweetInteractRetweet.dataset.val = parseInt(tweetInteractRetweet.innerText) - 1;
                tweetInteractRetweet.innerText = parseInt(tweetInteractRetweet.innerText) - 1;
            } else {
                tweetFooterRetweets.innerText = Number(parseInt(tweetFooterRetweets.innerText.replace(/\s/g, '').replace(/,/g, '').replace(/\./g, '')) - 1).toLocaleString().replace(/\s/g, ',');
            }
            delete t.newTweetId;
        }
    });
    if(options.mainTweet) {
        tweetInteractRetweetMenuQuotes.addEventListener('click', async () => {
            document.getElementById('loading-box').hidden = false;
            history.pushState({}, null, `https://twitter.com/${t.user.screen_name}/status/${t.id_str}/retweets/with_comments`);
            updateSubpage();
            mediaToUpload = [];
            linkColors = {};
            cursor = undefined;
            seenReplies = [];
            mainTweetLikers = [];
            let id = location.pathname.match(/status\/(\d{1,32})/)[1];
            if(subpage === 'tweet') {
                updateReplies(id);
            } else if(subpage === 'likes') {
                updateLikes(id);
            } else if(subpage === 'retweets') {
                updateRetweets(id);
            } else if(subpage === 'retweets_with_comments') {
                updateRetweetsWithComments(id);
            }
            renderDiscovery();
            renderTrends();
            currentLocation = location.pathname;
        });
        tweetInteractRetweetMenuRetweeters.addEventListener('click', async () => {
            document.getElementById('loading-box').hidden = false;
            history.pushState({}, null, `https://twitter.com/${t.user.screen_name}/status/${t.id_str}/retweets`);
            updateSubpage();
            mediaToUpload = [];
            linkColors = {};
            cursor = undefined;
            seenReplies = [];
            mainTweetLikers = [];
            let id = location.pathname.match(/status\/(\d{1,32})/)[1];
            if(subpage === 'tweet') {
                updateReplies(id);
            } else if(subpage === 'likes') {
                updateLikes(id);
            } else if(subpage === 'retweets') {
                updateRetweets(id);
            } else if(subpage === 'retweets_with_comments') {
                updateRetweetsWithComments(id);
            }
            renderDiscovery();
            renderTrends();
            currentLocation = location.pathname;
        });
    }
    tweetInteractRetweetMenuQuote.addEventListener('click', async () => {
        if (!tweetReply.hidden) {
            tweetInteractReply.classList.remove('tweet-interact-reply-clicked');
            tweetReply.hidden = true;
        }
        tweetQuote.hidden = false;
        setTimeout(() => {
            tweetQuoteText.focus();
        })
    });
    let quoteMedia = [];
    tweetQuote.addEventListener('drop', e => {
        handleDrop(e, quoteMedia, tweetQuoteMedia);
    });
    tweetQuote.addEventListener('paste', event => {
        let items = (event.clipboardData || event.originalEvent.clipboardData).items;
        for (index in items) {
            let item = items[index];
            if (item.kind === 'file') {
                let file = item.getAsFile();
                handleFiles([file], quoteMedia, tweetQuoteMedia);
            }
        }
    });
    tweetQuoteUpload.addEventListener('click', () => {
        getMedia(quoteMedia, tweetQuoteMedia);
    });
    tweetQuoteText.addEventListener('keydown', e => {
        if (e.key === 'Enter' && e.ctrlKey) {
            tweetQuoteButton.click();
        }
        tweetQuoteChar.innerText = `${tweetQuoteText.value.length}/280`;
        if(tweetQuoteText.value.length > 265) {
            tweetQuoteChar.style.color = "#c26363";
        } else {
            tweetQuoteChar.style.color = "";
        }
    });
    tweetQuoteText.addEventListener('keyup', e => {
        tweetQuoteChar.innerText = `${tweetQuoteText.value.length}/280`;
        if(tweetQuoteText.value.length > 265) {
            tweetQuoteChar.style.color = "#c26363";
        } else {
            tweetQuoteChar.style.color = "";
        }
    });
    tweetQuoteButton.addEventListener('click', async () => {
        let text = tweetQuoteText.value;
        tweetQuoteError.innerHTML = '';
        if (text.length === 0 && quoteMedia.length === 0) return;
        tweetQuoteButton.disabled = true;
        let uploadedMedia = [];
        for (let i in quoteMedia) {
            let media = quoteMedia[i];
            try {
                media.div.getElementsByClassName('new-tweet-media-img-progress')[0].hidden = false;
                let mediaId = await API.uploadMedia({
                    media_type: media.type,
                    media_category: media.category,
                    media: media.data,
                    alt: media.alt,
                    loadCallback: data => {
                        media.div.getElementsByClassName('new-tweet-media-img-progress')[0].innerText = `${data.text} (${data.progress}%)`;
                    }
                });
                uploadedMedia.push(mediaId);
            } catch (e) {
                media.div.getElementsByClassName('new-tweet-media-img-progress')[0].hidden = true;
                console.error(e);
                alert(e);
            }
        }
        let tweetObject = {
            status: text,
            attachment_url: `https://twitter.com/${t.user.screen_name}/status/${t.id_str}`,
            auto_populate_reply_metadata: true,
            batch_mode: 'off',
            exclude_reply_user_ids: '',
            cards_platform: 'Web-13',
            include_entities: 1,
            include_user_entities: 1,
            include_cards: 1,
            send_error_codes: 1,
            tweet_mode: 'extended',
            include_ext_alt_text: true,
            include_reply_count: true
        };
        if (uploadedMedia.length > 0) {
            tweetObject.media_ids = uploadedMedia.join(',');
        }
        let tweetData;
        try {
            tweetData = await API.postTweet(tweetObject)
        } catch (e) {
            tweetQuoteError.innerHTML = (e && e.message ? e.message : e) + "<br>";
            tweetQuoteButton.disabled = false;
            return;
        }
        if (!tweetData) {
            tweetQuoteError.innerHTML = "Error sending tweet<br>";
            tweetQuoteButton.disabled = false;
            return;
        }
        tweetQuoteText.value = '';
        tweetQuote.hidden = true;
        tweetData._ARTIFICIAL = true;
        quoteMedia = [];
        tweetQuoteButton.disabled = false;
        tweetQuoteMedia.innerHTML = '';
        if(typeof timeline !== 'undefined') timeline.data.unshift(tweetData);
        else appendTweet(tweetData, timelineContainer, { prepend: true });
    });

    // Favorite
    tweetInteractFavorite.addEventListener('click', () => {
        if (t.favorited) {
            API.unfavoriteTweet({
                id: t.id_str
            });
            t.favorited = false;
            t.favorite_count--;
            if(!options.mainTweet) {
                tweetInteractFavorite.dataset.val = parseInt(tweetInteractFavorite.innerText) - 1;
                tweetInteractFavorite.innerText = parseInt(tweetInteractFavorite.innerText) - 1;
            } else {
                if(mainTweetLikers.find(liker => liker.id_str === user.id_str)) {
                    mainTweetLikers.splice(mainTweetLikers.findIndex(liker => liker.id_str === user.id_str), 1);
                    let likerImg = footerFavorites.querySelector(`a[data-id="${user.id_str}"]`);
                    if(likerImg) likerImg.remove()
                }
                tweetFooterFavorites.innerText = Number(parseInt(tweetFooterFavorites.innerText.replace(/\s/g, '').replace(/,/g, '').replace(/\./g, '')) - 1).toLocaleString().replace(/\s/g, ',');
            }
            tweetInteractFavorite.classList.remove('tweet-interact-favorited');
        } else {
            API.favoriteTweet({
                id: t.id_str
            });
            t.favorited = true;
            t.favorite_count++;
            if(!options.mainTweet) {
                tweetInteractFavorite.dataset.val = parseInt(tweetInteractFavorite.innerText) + 1;
                tweetInteractFavorite.innerText = parseInt(tweetInteractFavorite.innerText) + 1;
            } else {
                if(footerFavorites.children.length < 8 && !mainTweetLikers.find(liker => liker.id_str === user.id_str)) {
                    let a = document.createElement('a');
                    a.href = `https://twitter.com/${user.screen_name}`;
                    let likerImg = document.createElement('img');
                    likerImg.src = user.profile_image_url_https;
                    likerImg.classList.add('tweet-footer-favorites-img');
                    likerImg.title = user.name + ' (@' + user.screen_name + ')';
                    likerImg.width = 24;
                    likerImg.height = 24;
                    a.dataset.id = user.id_str;
                    a.appendChild(likerImg);
                    footerFavorites.appendChild(a);
                    mainTweetLikers.push(user);
                }
                tweetFooterFavorites.innerText = Number(parseInt(tweetFooterFavorites.innerText.replace(/\s/g, '').replace(/,/g, '').replace(/\./g, '')) + 1).toLocaleString().replace(/\s/g, ',');
            }
            tweetInteractFavorite.classList.add('tweet-interact-favorited');
        }
    });

    // More
    let moreClicked = false;
    tweetInteractMore.addEventListener('click', () => {
        if (tweetInteractMoreMenu.hidden) {
            tweetInteractMoreMenu.hidden = false;
        }
        if(moreClicked) return;
        moreClicked = true;
        setTimeout(() => {
            document.body.addEventListener('click', () => {
                moreClicked = false;
                setTimeout(() => tweetInteractMoreMenu.hidden = true, 50);
            }, { once: true });
        }, 50);
    });
    if(tweetInteractMoreMenuFollow) tweetInteractMoreMenuFollow.addEventListener('click', async () => {
        if (t.user.following) {
            await API.unfollowUser(t.user.screen_name);
            t.user.following = false;
            tweetInteractMoreMenuFollow.innerText = `Follow @${t.user.screen_name}`;
        } else {
            await API.followUser(t.user.screen_name);
            t.user.following = true;
            tweetInteractMoreMenuFollow.innerText = `Unfollow @${t.user.screen_name}`;
        }
    });
    tweetInteractMoreMenuCopy.addEventListener('click', () => {
        navigator.clipboard.writeText(`https://twitter.com/${t.user.screen_name}/status/${t.id_str}`);
    });
    tweetInteractMoreMenuShare.addEventListener('click', () => {
        navigator.share({ url: `https://twitter.com/${t.user.screen_name}/status/${t.id_str}` });
    });
    tweetInteractMoreMenuEmbed.addEventListener('click', () => {
        openInNewTab(`https://publish.twitter.com/?query=https://twitter.com/${t.user.screen_name}/status/${t.id_str}&widget=Tweet`);
    });
    if (t.user.id_str === user.id_str) {
        tweetInteractMoreMenuAnalytics.addEventListener('click', () => {
            openInNewTab(`https://mobile.twitter.com/dimdenEFF/status/${t.id_str}/analytics`);
        });
        tweetInteractMoreMenuDelete.addEventListener('click', async () => {
            let sure = confirm("Are you sure you want to delete this tweet?");
            if (!sure) return;
            try {
                await API.deleteTweet(t.id_str);
            } catch (e) {
                alert(e);
                console.error(e);
                return;
            }
            if(options.after && !options.disableAfterReplyCounter) {
                options.after.getElementsByClassName('tweet-self-thread-div')[0].hidden = true;
                options.after.getElementsByClassName('tweet-interact-reply')[0].innerText = (+options.after.getElementsByClassName('tweet-interact-reply')[0].innerText - 1).toString();
            }
            Array.from(document.getElementById('timeline').getElementsByClassName(`tweet-id-${t.id_str}`)).forEach(tweet => {
                tweet.remove();
            });
            if(options.mainTweet) {
                let tweets = Array.from(document.getElementsByClassName('tweet'));
                if(tweets.length === 0) {
                    location.href = 'https://twitter.com/home';
                } else {
                    location.href = tweets[0].getElementsByClassName('tweet-time')[0].href;
                }
            }
            if(options.after) {
                if(options.after.getElementsByClassName('tweet-self-thread-div')[0]) options.after.getElementsByClassName('tweet-self-thread-div')[0].hidden = true;
                if(!options.after.classList.contains('tweet-main')) options.after.getElementsByClassName('tweet-interact-reply')[0].innerText = (+options.after.getElementsByClassName('tweet-interact-reply')[0].innerText - 1).toString();
                else options.after.getElementsByClassName('tweet-footer-stat-replies')[0].innerText = (+options.after.getElementsByClassName('tweet-footer-stat-replies')[0].innerText - 1).toString();
            }
        });
        if(tweetInteractMoreMenuPin) tweetInteractMoreMenuPin.addEventListener('click', async () => {
            if(pinnedTweet && pinnedTweet.id_str === t.id_str) {
                await API.unpinTweet(t.id_str);
                pinnedTweet = null;
                tweet.remove();
                let tweetTime = new Date(t.created_at).getTime();
                let beforeTweet = Array.from(document.getElementsByClassName('tweet')).find(i => {
                    let timestamp = +i.getElementsByClassName('tweet-time')[0].dataset.timestamp;
                    return timestamp < tweetTime;
                });
                if(beforeTweet) {
                    appendTweet(t, timelineContainer, { after: beforeTweet, disableAfterReplyCounter: true });
                }
                return;
            } else {
                await API.pinTweet(t.id_str);
                pinnedTweet = t;
                let pinnedTweetElement = Array.from(document.getElementsByClassName('tweet')).find(i => {
                    let topText = i.getElementsByClassName('tweet-top-text')[0];
                    return (topText && topText.innerText === 'Pinned Tweet');
                });
                if(pinnedTweetElement) {
                    pinnedTweetElement.remove();
                }
                tweet.remove();
                appendTweet(t, timelineContainer, {
                    prepend: true,
                    top: {
                        text: 'Pinned Tweet',
                        icon: "\uf003",
                        color: "var(--link-color)"
                    }
                });
                return;
            }
        });
    }
    tweetInteractMoreMenuRefresh.addEventListener('click', async () => {
        let tweetData;
        try {
            tweetData = await API.getTweet(t.id_str);
        } catch (e) {
            console.error(e);
            return;
        }
        if (!tweetData) {
            return;
        }
        if(typeof timeline !== 'undefined') {
            let tweetIndex = timeline.data.findIndex(tweet => tweet.id_str === t.id_str);
            if (tweetIndex !== -1) {
                timeline.data[tweetIndex] = tweetData;
            }
        }
        if (tweetInteractFavorite.className.includes('tweet-interact-favorited') && !tweetData.favorited) {
            tweetInteractFavorite.classList.remove('tweet-interact-favorited');
        }
        if (tweetInteractRetweet.className.includes('tweet-interact-retweeted') && !tweetData.retweeted) {
            tweetInteractRetweet.classList.remove('tweet-interact-retweeted');
        }
        if (!tweetInteractFavorite.className.includes('tweet-interact-favorited') && tweetData.favorited) {
            tweetInteractFavorite.classList.add('tweet-interact-favorited');
        }
        if (!tweetInteractRetweet.className.includes('tweet-interact-retweeted') && tweetData.retweeted) {
            tweetInteractRetweet.classList.add('tweet-interact-retweeted');
        }
        if(!options.mainTweet) {
            tweetInteractFavorite.innerText = tweetData.favorite_count;
            tweetInteractRetweet.innerText = tweetData.retweet_count;
            tweetInteractReply.innerText = tweetData.reply_count;
        }
    });
    let downloading = false;
    if (t.extended_entities && t.extended_entities.media.length === 1) {
        tweetInteractMoreMenuDownload.addEventListener('click', () => {
            if (downloading) return;
            downloading = true;
            let media = t.extended_entities.media[0];
            let url = media.type === 'photo' ? media.media_url_https : media.video_info.variants[0].url;
            fetch(url).then(res => res.blob()).then(blob => {
                downloading = false;
                let a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = media.type === 'photo' ? media.media_url_https.split('/').pop() : media.video_info.variants[0].url.split('/').pop();
                a.download = a.download.split('?')[0];
                a.click();
                a.remove();
            }).catch(e => {
                downloading = false;
                console.error(e);
            });
        });
        if (t.extended_entities.media[0].type === 'animated_gif') {
            tweetInteractMoreMenuDownloadGif.addEventListener('click', () => {
                if (downloading) return;
                downloading = true;
                let video = tweet.getElementsByClassName('tweet-media-element')[0];
                let canvas = document.createElement('canvas');
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                let ctx = canvas.getContext('2d');
                if (video.duration > 10 && !confirm('This video is longer than 10 seconds. Are you sure you want to convert it, might lag')) {
                    return downloading = false;
                }
                let gif = new GIF({
                    workers: 2,
                    quality: 10
                });
                video.currentTime = 0;
                video.loop = false;
                let isFirst = true;
                let interval = setInterval(async () => {
                    if(isFirst) {
                        video.currentTime = 0;
                        isFirst = false;
                        await sleep(5);
                    }
                    if (video.currentTime+0.1 >= video.duration) {
                        clearInterval(interval);
                        gif.on('finished', blob => {
                            let a = document.createElement('a');
                            a.href = URL.createObjectURL(blob);
                            a.download = `${t.id_str}.gif`;
                            document.body.append(a);
                            a.click();
                            a.remove();
                            downloading = false;
                            video.loop = true;
                            video.play();
                        });
                        gif.render();
                        return;
                    }
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                    let imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    gif.addFrame(imgData, { delay: 100 });
                }, 100);
            });
        }
    }
    if(tweetInteractMoreMenuFeedbacks) tweetInteractMoreMenuFeedbacks.forEach(feedbackButton => {
        let feedback = t.feedback[feedbackButton.dataset.index];
        if (!feedback) return;
        feedbackButton.addEventListener('click', () => {
            if(feedback.richBehavior && feedback.richBehavior.markNotInterestedTopic) {
                fetch(`https://twitter.com/i/api/graphql/OiKldXdrDrSjh36WO9_3Xw/TopicNotInterested`, {
                    method: 'post',
                    headers: {
                        'content-type': 'application/json',
                        'authorization': OLDTWITTER_CONFIG.public_token,
                        "x-twitter-active-user": 'yes',
                        "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                        "x-twitter-auth-type": 'OAuth2Session',
                    },
                    body: JSON.stringify({"variables":{"topicId": feedback.richBehavior.markNotInterestedTopic.topicId,"undo":false},"queryId":"OiKldXdrDrSjh36WO9_3Xw"}),
                    credentials: 'include'
                }).then(i => i.json()).then(() => {});
            }
            fetch(`https://twitter.com/i/api/graphql/vfVbgvTPTQ-dF_PQ5lD1WQ/timelinesFeedback`, {
                method: 'post',
                headers: {
                    'content-type': 'application/json',
                    'authorization': OLDTWITTER_CONFIG.public_token,
                    "x-twitter-active-user": 'yes',
                    "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                    "x-twitter-auth-type": 'OAuth2Session',
                },
                body: JSON.stringify({"variables":{"encoded_feedback_request": feedback.encodedFeedbackRequest,"undo":false},"queryId":"vfVbgvTPTQ-dF_PQ5lD1WQ"}),
                credentials: 'include'
            }).then(i => i.json()).then(i => {
                alert(feedback.confirmation ? feedback.confirmation : 'Thanks for your feedback!');
                tweet.remove();
            });
        });
    });

    if(options.after) {
        options.after.after(tweet);
    } else if (options.prepend) {
        timelineContainer.prepend(tweet);
    } else {
        timelineContainer.append(tweet);
    }
    if(vars.enableTwemoji) twemoji.parse(tweet);
    return tweet;
}