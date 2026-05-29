"use strict";

/* =========================================
   MOBILE NAVIGATION
========================================= */

const navToggle = document.querySelector(".mobile-nav-toggle");
const navMenu = document.querySelector(".nav-list");

if (navToggle && navMenu) {
  navToggle.addEventListener("click", () => {
    const expanded =
      navToggle.getAttribute("aria-expanded") === "true";

    navToggle.setAttribute(
      "aria-expanded",
      String(!expanded)
    );

    navMenu.style.display =
      expanded ? "none" : "flex";
  });
}

/* =========================================
   REVEAL ON SCROLL
========================================= */

const revealElements =
  document.querySelectorAll(".reveal");

const revealObserver =
  new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");

          revealObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.15,
    }
  );

revealElements.forEach((element) => {
  revealObserver.observe(element);
});

/* =========================================
   FORM VALIDATION
========================================= */

const form =
  document.querySelector(".contact-form");

if (form) {
  form.addEventListener("submit", (event) => {

    const inputs =
      form.querySelectorAll("input, textarea");

    let isValid = true;

    inputs.forEach((input) => {

      const value =
        input.value.trim();

      // Basic sanitization
      input.value = value
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

      if (
        input.hasAttribute("required") &&
        value.length === 0
      ) {
        isValid = false;
      }
    });

    if (!isValid) {
      event.preventDefault();

      const status =
        form.querySelector(".form-status");

      if (status) {
        status.textContent =
          "Please complete all required fields.";
      }
    }
  });
}
