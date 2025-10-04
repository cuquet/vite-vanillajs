// File#: _1_swipe-content
// Usage: https://codyhouse.co/ds/components/app/swipe-content

class SwipeContent {
    constructor(element) {
        this.element = element;
        this.delta = [false, false];
        this.dragging = false;
        this.intervalId = false;
        this.initSwipeContent(this);
    }
    initSwipeContent(content) {
        content.element.addEventListener('mousedown', this.handleEvent.bind(content))
        content.element.addEventListener('touchstart', this.handleEvent.bind(content), {
            passive: true,
        })
    }
    initDragging(content) {
        //add event listeners
        content.element.addEventListener('mousemove', this.handleEvent.bind(content))
        content.element.addEventListener('touchmove', this.handleEvent.bind(content), {
            passive: true,
        })
        content.element.addEventListener('mouseup', this.handleEvent.bind(content))
        content.element.addEventListener('mouseleave', this.handleEvent.bind(content))
        content.element.addEventListener('touchend', this.handleEvent.bind(content))
    }

    cancelDragging(content) {
        //remove event listeners
        if (content.intervalId) {
            !window.requestAnimationFrame
                ? clearInterval(content.intervalId)
                : window.cancelAnimationFrame(content.intervalId)
            content.intervalId = false
        }
        content.element.removeEventListener('mousemove', this.handleEvent.bind(content))
        content.element.removeEventListener('touchmove', this.handleEvent.bind(content))
        content.element.removeEventListener('mouseup', this.handleEvent.bind(content))
        content.element.removeEventListener('mouseleave', this.handleEvent.bind(content))
        content.element.removeEventListener('touchend', this.handleEvent.bind(content))
    }



    startDrag(content, event) {
        content.dragging = true
        // listen to drag movements
        this.initDragging(content)
        content.delta = [
            parseInt(this.unify(event).clientX),
            parseInt(this.unify(event).clientY),
        ]
        // emit drag start event
        this.emitSwipeEvents(content, 'dragStart', content.delta, event.target)
    }

    endDrag(content, event) {
        this.cancelDragging(content)
        // credits: https://css-tricks.com/simple-swipe-with-vanilla-javascript/
        var dx = parseInt(this.unify(event).clientX),
            dy = parseInt(this.unify(event).clientY)

        // check if there was a left/right swipe
        if (content.delta && (content.delta[0] || content.delta[0] === 0)) {
            var s = this.getSign(dx - content.delta[0])

            if (Math.abs(dx - content.delta[0]) > 30) {
                s < 0
                    ? this.emitSwipeEvents(content, 'swipeLeft', [dx, dy])
                    : this.emitSwipeEvents(content, 'swipeRight', [dx, dy])
            }

            content.delta[0] = false
        }
        // check if there was a top/bottom swipe
        if (content.delta && (content.delta[1] || content.delta[1] === 0)) {
            var y = this.getSign(dy - content.delta[1])

            if (Math.abs(dy - content.delta[1]) > 30) {
                y < 0
                    ? this.emitSwipeEvents(content, 'swipeUp', [dx, dy])
                    : this.emitSwipeEvents(content, 'swipeDown', [dx, dy])
            }

            content.delta[1] = false
        }
        // emit drag end event
        this.emitSwipeEvents(content, 'dragEnd', [dx, dy])
        content.dragging = false
    }

    drag(content, event) {
        if (!content.dragging) return
        // emit dragging event with coordinates
        !window.requestAnimationFrame
            ? (content.intervalId = setTimeout(function () {
                this.emitDrag.bind(content, event)
            }, 250))
            : (content.intervalId = window.requestAnimationFrame(
                this.emitDrag.bind(content, event),
            ))
    }

    emitDrag(event) {
        this.emitSwipeEvents(this, 'dragging', [
            parseInt(this.unify(event).clientX),
            parseInt(this.unify(event).clientY),
        ])
    }

    unify(event) {
        // unify mouse and touch events
        return event.changedTouches ? event.changedTouches[0] : event
    }

    emitSwipeEvents(content, eventName, detail, el) {
        var trigger = false
        if (el) trigger = el
        // emit event with coordinates
        var event = new CustomEvent(eventName, {
            detail: { x: detail[0], y: detail[1], origin: trigger },
        })
        content.element.dispatchEvent(event)
    }

    getSign(x) {
        if (!Math.sign) {
            return (x > 0) - (x < 0) || +x
        } else {
            return Math.sign(x)
        }
    }
    handleEvent(event) {
        switch (event.type) {
            case 'mousedown':
            case 'touchstart':
                this.startDrag(this, event)
                break
            case 'mousemove':
            case 'touchmove':
                this.drag(this, event)
                break
            case 'mouseup':
            case 'mouseleave':
            case 'touchend':
                this.endDrag(this, event)
                break
        }
    }
}

export default SwipeContent;


// window.SwipeContent = SwipeContent

// //initialize the SwipeContent objects
// var swipe = document.getElementsByClassName('js-swipe-content')
// if (swipe.length > 0) {
//     for (var i = 0; i < swipe.length; i++) {
//         ; (function (i) {
//             new SwipeContent(swipe[i])
//         })(i)
//     }
// }

