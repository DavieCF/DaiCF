/*QA click*/
$(".qa-title").click(function () {
    $(".qa-content").slideUp();
    $(".qa-title.on").removeClass("on");
    $(this).next().stop().slideDown();
    $(this).stop().addClass("on");
});

/*移移動偏移往上*/ 
$(document).ready(function(){
$('a[href^="#"]').on('click', function(event) {
    var target = $(this.getAttribute('href'));

    if(target.length) {
        event.preventDefault();

        // 滾動偏移量
        var offset = 130; // 你可以調整這個值來改變滾動的偏移量，正數表示偏上，負數表示偏下

        $('html, body').stop().animate({
            scrollTop: target.offset().top - offset
        }, 1000);
    }
});
});

/*禁止手機用戶左右活動*/
document.addEventListener('touchstart', function(e) {
let startX = e.touches[0].pageX;
let startY = e.touches[0].pageY;

document.addEventListener('touchmove', function(e) {
    let moveX = e.touches[0].pageX;
    let moveY = e.touches[0].pageY;
    
    // Check if horizontal move is larger than vertical move
    if (Math.abs(moveX - startX) > Math.abs(moveY - startY)) {
        e.preventDefault();
    }
    }, { passive: false });
}, { passive: false });