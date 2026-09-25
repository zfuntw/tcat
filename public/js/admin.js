(function () {
  var csrf = document.querySelector('meta[name=csrf]').content;

  // 刪除等危險操作前確認
  document.querySelectorAll('form[data-confirm]').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      if (!confirm(f.dataset.confirm)) e.preventDefault();
    });
  });

  // 選圖後即時預覽
  document.querySelectorAll('input[data-preview]').forEach(function (input) {
    input.addEventListener('change', function () {
      var file = input.files[0];
      var box = input.closest('.image-field').querySelector('.preview');
      if (file) box.innerHTML = '<img src="' + URL.createObjectURL(file) + '" alt="">';
    });
  });

  // 顏色欄位同步顯示色碼
  document.querySelectorAll('.color-row input').forEach(function (input) {
    input.addEventListener('input', function () { input.nextElementSibling.textContent = input.value; });
  });

  // 媒體庫複製網址
  document.querySelectorAll('[data-copy-url]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      navigator.clipboard.writeText(btn.dataset.copyUrl).then(function () {
        btn.textContent = '已複製 ✓';
        setTimeout(function () { btn.textContent = '複製網址'; }, 1500);
      });
    });
  });

  // 所見即所得編輯器
  if (!window.Quill) return;
  var dirty = false;
  document.querySelectorAll('.editor').forEach(function (el) {
    var target = document.getElementById(el.dataset.target);
    var quill = new Quill(el, {
      theme: 'snow',
      placeholder: '開始撰寫內容…',
      modules: {
        toolbar: {
          container: [
            [{ header: [2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ color: [] }, { background: [] }],
            [{ list: 'ordered' }, { list: 'bullet' }, { align: [] }],
            ['blockquote', 'link', 'image', 'video'],
            ['clean']
          ],
          handlers: { image: function () { uploadImage(quill); } }
        }
      }
    });
    quill.clipboard.dangerouslyPasteHTML(target.value || '');
    quill.on('text-change', function (delta, old, source) {
      if (source === 'user') dirty = true;
      target.value = quill.root.innerHTML === '<p><br></p>' ? '' : quill.root.innerHTML;
    });
  });

  function uploadImage(quill) {
    var input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = function () {
      var file = input.files[0];
      if (!file) return;
      var fd = new FormData();
      fd.append('file', file);
      fetch('/admin/media/upload', { method: 'POST', body: fd, headers: { 'x-csrf-token': csrf, accept: 'application/json' } })
        .then(function (r) { return r.json(); })
        .then(function (data) {
          if (data.error) return alert(data.error);
          var range = quill.getSelection(true);
          quill.insertEmbed(range.index, 'image', data.url, 'user');
          quill.setSelection(range.index + 1);
        })
        .catch(function () { alert('圖片上傳失敗'); });
    };
    input.click();
  }

  // 未儲存離開提醒
  document.querySelectorAll('form').forEach(function (f) {
    f.addEventListener('submit', function () { dirty = false; });
    f.addEventListener('input', function () { dirty = true; });
  });
  window.addEventListener('beforeunload', function (e) {
    if (dirty) { e.preventDefault(); e.returnValue = ''; }
  });
})();
