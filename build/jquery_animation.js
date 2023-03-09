// Click "Congratulations!" to play animation
$(function() {
	var numberOfStars = 30;
	for (var i = 0; i < numberOfStars; i++) {
	  $('.congrats').append('<div class="Blob fa fa-star ' + i + '"></div>');
	}	
	animateText();
	animateBlobs();
});
 
setInterval(() => {
	const congrats = document.querySelector('.congrats');
	congrats.style.display = 'flex';
	reset();
	animateText();
	animateBlobs();
  
	setTimeout(() => {
	  congrats.style.display = 'none';
	}, 3000);
  }, 8000);

 
function reset() {
	$.each($('.Blob'), function(i) {
		TweenMax.set($(this), { x: 0, y: 0, opacity: 1 });
	});
	TweenMax.set($('h1'), { scale: 1, opacity: 1, rotation: 0 });
}
function animateText() {
		TweenMax.from($('.congrats h1'), 0.8, {
		scale: 0.4,
		opacity: 0,
		rotation: 15,
		ease: Back.easeOut.config(4),
	});
}
function animateBlobs() {
	
	var xSeed = _.random(350, 380);
	var ySeed = _.random(120, 170);
	$.each($('.Blob'), function(i) {
		var $Blob = $(this);
		var speed = _.random(1, 5);
		var rotation = _.random(5, 100);
		var scale = _.random(0.8, 1.5);
		var x = _.random(-xSeed, xSeed);
		var y = _.random(-ySeed, ySeed);
 
		TweenMax.to($Blob, speed, {
			x: x,
			y: y,
			ease: Power1.easeOut,
			opacity: 0,
			rotation: rotation,
			scale: scale,
			onStartParams: [$Blob],
			onStart: function($element) {
				$element.css('display', 'block');
			},
			onCompleteParams: [$Blob],
			onComplete: function($element) {
				$element.css('display', 'none');
			}
		});
	});
}