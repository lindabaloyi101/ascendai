/* Tiny, safe Markdown renderer: headings, bold, italic, links, lists. HTML in posts is escaped. */
(function () {
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
  function inline(s) {
    s = esc(s);
    s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, function (m, t, u) {
      if (!/^(https?:|mailto:|\/|#|\.\.?\/)/i.test(u)) return m;
      return '<a href="' + u + '"' + (/^https?:/i.test(u) ? ' target="_blank" rel="noopener"' : "") + ">" + t + "</a>";
    });
    return s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>").replace(/(^|[^*])\*([^*\s][^*]*)\*/g, "$1<em>$2</em>");
  }
  function render(src) {
    var out = [], lines = String(src || "").replace(/\r/g, "").split("\n"), i = 0, m;
    var UL = /^\s*[-*]\s+/, OL = /^\s*\d+\.\s+/;
    while (i < lines.length) {
      var l = lines[i];
      if (!l.trim()) { i++; continue; }
      if ((m = l.match(/^(#{1,3})\s+(.*)$/))) { var n = m[1].length + 1; out.push("<h" + n + ">" + inline(m[2]) + "</h" + n + ">"); i++; continue; }
      if (UL.test(l) || OL.test(l)) {
        var ol = OL.test(l), re = ol ? OL : UL, items = [];
        while (i < lines.length && re.test(lines[i])) { items.push("<li>" + inline(lines[i].replace(re, "")) + "</li>"); i++; }
        out.push((ol ? "<ol>" : "<ul>") + items.join("") + (ol ? "</ol>" : "</ul>")); continue;
      }
      var p = [];
      while (i < lines.length && lines[i].trim() && !/^(#{1,3}\s|\s*[-*]\s|\s*\d+\.\s)/.test(lines[i])) { p.push(inline(lines[i])); i++; }
      out.push("<p>" + p.join("<br>") + "</p>");
    }
    return out.join("\n");
  }
  window.MD = { render: render, esc: esc };
})();
