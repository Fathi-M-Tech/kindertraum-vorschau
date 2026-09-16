
// kv
const Keyvisual = {
	
	init: function() {
		this.slideshow.target = document.getElementsByClassName("slideshow")[0];
		this.slideshow.reel = this.slideshow.target.getElementsByClassName("img-reel")[0];
		this.slideshow.items = this.slideshow.reel.getElementsByClassName("img-reel__item");
	},
	
	slideshow: {

		target: "",
		option: "",
		reel: "",
		length: 0,
		items: "",
		current: 0,
		timeoutId: 0,
		startTimeoutId: 0,
		duration: 0,
		
		init: function (option) {
			let t = this;
			let l = this.length;
			let comp = window.getComputedStyle(this.items[0]);
			let ad = parseInt(comp.getPropertyValue('animation-duration')) * 1000;
			let td = parseInt(comp.getPropertyValue('transition-duration')) * 1000;
			
			this.length = this.items.length;
			this.duration = option ? option.delay : Math.max(ad, td);
			
			for (let i = 0; i < this.length; i++) {
				let img = this.items[i].getElementsByClassName("img-reel__item-bg")[0];
				let inner;

				if (img.tagName === "IMG") {
					let url = img.getAttribute("src");
					inner = this.items[i].getElementsByClassName("img-reel__item-inner")[0];
					inner.style.backgroundImage = "url(" + url +")";
				}
			}
		},
		
		start: function() {
			let num = 0;
			let first = this.items[num];
			first.classList.add("current");
			this.target.classList.add("-start");
			this.current = num;
			this.play(num);
			
			this.startTimeoutId = setTimeout(function() {
				first.getElementsByClassName("img-reel__item-bg")[0].classList.remove("animation");
			}, this.duration);
		},
		
		play: function(n) {
			let i, l;
			let t = this;
			this.current = n ? n : 0;
			
			this.timeoutId = setTimeout(function() {
				let n = t.current === t.length - 1 ? 0 : t.current + 1;
				t.next(n);
				t.play(n);
			}, this.duration);
		},
		
		next: function (n) {
			let prevNum = n - 1;
			
			if (prevNum < 0) {
				prevNum = this.length - 1;
			}
			
			for (let i = 0; i < this.length; i++) {
				let target = this.reel.getElementsByClassName("img-reel__item")[i];
				target.classList.remove("current");
				target.classList.remove("prev");
				
				if (i === n) {
					target.classList.add("current");
				} else if (i === prevNum) {
					target.classList.add("prev");
				}
			}
			
			this.current = n;
		},
		
		destroy: function(t) {
			clearTimeout(t.timeoutId);
			clearTimeout(t.startTimeoutId);
		}
	},
	
	destroy: function() {
		Keyvisual.slideshow.destroy(Keyvisual.slideshow);
	}
}



// shinkansen entfernt (Kindertraum: Ballon wird per CSS in kindertraum.css animiert)



document.addEventListener("DOMContentLoaded", function () {
	let kv = document.getElementById("kv");
	
	Keyvisual.init();
	Keyvisual.slideshow.init();
	kv.classList.add("-ready");

});

window.addEventListener("load", function() {
	var b = document.getElementsByTagName("body")[0];

	let kv = document.getElementById("kv");

	Keyvisual.slideshow.start();
	kv.classList.add("-start");
});






