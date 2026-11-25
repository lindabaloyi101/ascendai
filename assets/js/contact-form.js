(function () {
  var form = document.getElementById("contact-form"); if (!form) return;
  var status = document.getElementById("form-status"), cfg = window.ASCEND || {};
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (form.website.value) return; // honeypot
    var d = { name: form.name.value, email: form.email.value, company: form.company.value, message: form.message.value };
    if (cfg.formEndpoint) {
      status.textContent = "Sending…";
      fetch(cfg.formEndpoint, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(d) })
        .then(function (r) { if (!r.ok) throw 0; form.reset(); status.textContent = "Thanks. We’ll reply within one working day."; })
        .catch(function () { status.textContent = "Something went wrong. Please email " + cfg.email + " instead."; });
    } else {
      var body = "Name: " + d.name + "\nCompany: " + d.company + "\nEmail: " + d.email + "\n\n" + d.message;
      status.textContent = "Your email app should open with the message ready to send.";
      location.href = "mailto:" + cfg.email + "?subject=" + encodeURIComponent("Enquiry from " + d.name) + "&body=" + encodeURIComponent(body);
    }
  });
})();
