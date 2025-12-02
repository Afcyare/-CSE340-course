document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("#updateForm");

  form.addEventListener("change", function () {
    const updateBtn = form.querySelector("button");
    updateBtn.removeAttribute("disabled");
  });
});
