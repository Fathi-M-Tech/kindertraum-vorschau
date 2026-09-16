/* ==========================================================================
   Kindertraum – eigene Skripte (ergänzt module_common.js / page_home.js)
   1. Scroll-Reveal für Karten (Fade + 16px nach oben, siehe kindertraum.css)
   2. Platzhalter-Links (href="#") neutralisieren, damit der Smoothscroll der
      Vorlage nicht auf ein leeres Ziel läuft.
   ========================================================================== */

(function () {
	"use strict";

	// 1. Scroll-Reveal ------------------------------------------------------
	function reveal() {
		var items = document.querySelectorAll(".newsList__item, .menuBlock, .facilityList__item, .team-lead-card, .team-card, .team-value, .team-cta");
		var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

		if (!("IntersectionObserver" in window) || reduce) {
			for (var i = 0; i < items.length; i++) {
				items[i].classList.add("is-visible");
			}
			return;
		}

		var io = new IntersectionObserver(function (entries) {
			entries.forEach(function (entry) {
				if (entry.isIntersecting) {
					entry.target.classList.add("is-visible");
					io.unobserve(entry.target);
				}
			});
		}, { rootMargin: "0px 0px -10% 0px", threshold: 0.1 });

		for (var j = 0; j < items.length; j++) {
			io.observe(items[j]);
		}
	}

	// 2. Platzhalter-Links --------------------------------------------------
	// Capture-Phase: läuft vor dem Smoothscroll-Listener aus module_common.js.
	document.addEventListener("click", function (e) {
		var a = e.target.closest ? e.target.closest('a[href="#"]') : null;
		if (a) {
			e.preventDefault();
			e.stopPropagation();
		}
	}, true);

	document.addEventListener("DOMContentLoaded", reveal);
})();
