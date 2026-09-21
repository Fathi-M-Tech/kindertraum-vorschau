/* ==========================================================================
   Kindertraum – eigene Skripte (ergänzt module_common.js / page_home.js)
   1. Scroll-Reveal für Karten (Fade + 16px nach oben, siehe kindertraum.css)
   2. Platzhalter-Links (href="#") neutralisieren, damit der Smoothscroll der
      Vorlage nicht auf ein leeres Ziel läuft.
   3. Kontaktformular: bedingtes Feld, simulierter Versand
   4. Kontaktformular: weitere Kinder hinzufügen/entfernen (z.B. Zwillinge)
   ========================================================================== */

(function () {
	"use strict";

	// 1. Scroll-Reveal ------------------------------------------------------
	function reveal() {
		var items = document.querySelectorAll(".newsList__item, .menuBlock, .facilityList__item, .team-lead-card, .team-card, .team-value, .team-cta, .kontakt-card, .groupTile");
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

	// 3. Kontaktformular: bedingtes Feld, Button-Text, simulierter Versand --
	function initKontaktForm() {
		var form = document.querySelector(".kontakt-form");
		if (!form) return;

		var requestType = document.getElementById("kontaktRequestType");
		var visitField = document.getElementById("kontaktVisitField");
		var success = form.querySelector(".kontakt-form__success");

		function syncVisitField() {
			var isVisit = requestType.value === "besichtigung";
			visitField.classList.toggle("is-active", isVisit);
		}

		requestType.addEventListener("change", syncVisitField);
		syncVisitField();

		form.addEventListener("submit", function (e) {
			e.preventDefault();
			// Da das Formular `novalidate` trägt, muss die Validierung hier explizit laufen -
			// erst bei einem gueltigen Formular wird etwas ausgeblendet/als versendet markiert.
			if (!form.checkValidity()) {
				form.reportValidity();
				return;
			}
			// Simulierter Versand: kein Backend in dieser Vorschau-Phase (siehe Projekt-Doku).
			// Echter Versand folgt bei der WordPress-Uebertragung ueber einen eigenen Handler.
			Array.prototype.forEach.call(form.querySelectorAll(".kontakt-form__row, .kontakt-form__actions"), function (el) {
				el.hidden = true;
			});
			success.hidden = false;
		});
	}

	document.addEventListener("DOMContentLoaded", initKontaktForm);

	// 4. Kontaktformular: weitere Kinder (z.B. Zwillinge) ------------------
	function initKontaktChildren() {
		var container = document.getElementById("kontaktChildren");
		var addBtn = document.getElementById("kontaktAddChild");
		if (!container || !addBtn) return;

		function addRow() {
			var row = container.querySelector(".kontakt-form__child-row").cloneNode(true);
			Array.prototype.forEach.call(row.querySelectorAll("input"), function (input) {
				input.value = "";
			});

			var removeBtn = document.createElement("button");
			removeBtn.type = "button";
			removeBtn.className = "kontakt-form__remove-child";
			removeBtn.setAttribute("aria-label", "Kind entfernen");
			removeBtn.innerHTML = '<span aria-hidden="true">×</span>';
			removeBtn.addEventListener("click", function () {
				row.remove();
			});
			row.appendChild(removeBtn);

			container.appendChild(row);
			row.querySelector('input[type="text"]').focus();
		}

		addBtn.addEventListener("click", addRow);
	}

	document.addEventListener("DOMContentLoaded", initKontaktChildren);
})();
