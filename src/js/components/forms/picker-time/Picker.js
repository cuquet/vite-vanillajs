class Hourspicker {
    constructor(data) {
        Object.assign(this, data);

        this.isMove = false;

        this.init();
    }

    init() {
        this.hourspicker = this.create();
    }

    get() {
        return this.hourspicker;
    }

    create() {
        const hourspicker = document.createElement('div');
        hourspicker.classList.add('column', 'left');
        hourspicker.addEventListener('mousedown', this.handleStart.bind(this));
        hourspicker.addEventListener('touchstart', this.handleStart.bind(this), { passive: true });

        const viewerLeft = document.createElement('div');
        viewerLeft.classList.add('viewer');
        hourspicker.appendChild(viewerLeft);

        this.hoursEl = document.createElement('div');
        this.hoursEl.classList.add('hours');
        viewerLeft.appendChild(this.hoursEl);

        this.time.hours.get().forEach((hour) => {
            const hourEl = document.createElement('div');
            hourEl.classList.add('hour', hour.type);
            hourEl.textContent = hour.hour.toString().padStart(2, '0');
            this.hoursEl.appendChild(hourEl);
        });

        return hourspicker;
    }

    handleStart(e) {
        this.isMove = true;

        this.move = this.handleMove.bind(this);
        this.end = this.handleEnd.bind(this);

        document.addEventListener('mousemove', this.move);
        document.addEventListener('touchmove', this.move, { passive: true });
        document.addEventListener('mouseup', this.end);
        document.addEventListener('touchend', this.end, { passive: true });

        const y = e.clientY ?? e.touches[0].clientY;

        this.startY = y;
        this.currentY = y;
        this.startTop = this.hoursEl.offsetTop;

        this.startTime = new Date();

        this.reset();
    }

    handleMove(e) {
        if (!this.isMove) {
            return;
        }

        const y = e.clientY ?? e.touches[0].clientY;

        this.currentMoveY = y - this.currentY;
        this.totalMoveY = y - this.startY;

        this.paint();
    }

    handleEnd() {
        if (!this.isMove) {
            return;
        }

        this.isMove = false;

        this.hoursEl.style.top = `${this.startTop}px`;

        this.endTime = new Date();
        this.elapsedTime = this.endTime.getTime() - this.startTime.getTime();
        this.pixelsPerTime = Math.abs(this.totalMoveY / this.elapsedTime);
        this.directionY = Math.sign(this.totalMoveY / this.elapsedTime);

        requestAnimationFrame(this.loop.bind(this));

        document.removeEventListener('mousemove', this.move);
        document.removeEventListener('touchmove', this.move);
        document.removeEventListener('mouseup', this.end);
        document.removeEventListener('touchend', this.end);
    }

    loop(timeStamp) {
        if (this.isMove) {
            return;
        }

        if (!this.oldTimeStamp) {
            this.oldTimeStamp = timeStamp;
        }

        this.timePassed = timeStamp - this.oldTimeStamp;
        this.oldTimeStamp = timeStamp;

        this.currentMoveY += this.pixelsPerTime * this.timePassed * this.directionY;
        this.reduction = this.reduction * this.reductionRatio;
        this.pixelsPerTime = this.pixelsPerTime - this.reduction;

        this.paint();

        if (this.pixelsPerTime < 0) {
            this.hoursEl.style.top = -100 + 'px';
            return;
        }

        requestAnimationFrame(this.loop.bind(this));
    }

    paint() {
        this.hoursEl.style.top = `${this.startTop + this.currentMoveY}px`;

        const top = this.hoursEl.offsetTop;

        if (top < -130) {
            this.hoursEl.appendChild(this.hoursEl.firstChild);
            this.time.hours.next();
        }

        if (top > -70) {
            this.hoursEl.prepend(this.hoursEl.lastChild);
            this.time.hours.prev();
        }

        if (top < -130 || top > -70) {
            this.hoursEl.style.top = -100 + 'px';

            this.currentY = this.currentY + this.currentMoveY;
            this.currentMoveY = 0;

            this.hoursEl.childNodes.forEach((el, i) => {
                el.classList.remove('prev-last', 'prev', 'current', 'next', 'next-last', 'hidden');
                el.classList.add(this.time.hours.get()[i].type);
            });
        }
    }

    reset() {
        this.currentMoveY = 0;
        this.totalMoveY = 0;
        this.oldTimeStamp = null;
        this.reduction = 0.01;
        this.reductionRatio = 1.02;
    }

    destroy() {
        if (this.hourspicker) {
            this.hourspicker.remove();
        }
    }
}

class Minutespicker {
    constructor(data) {
        Object.assign(this, data);

        this.isMove = false;

        this.init();
    }

    init() {
        this.minutespicker = this.create();
    }

    get() {
        return this.minutespicker;
    }

    render() {
        this.destroy();
        this.init();
    }

    create() {
        const minutespicker = document.createElement('div');
        minutespicker.classList.add('column', 'right');
        minutespicker.addEventListener('mousedown', this.handleStart.bind(this));
        minutespicker.addEventListener('touchstart', this.handleStart.bind(this), {
            passive: true,
        });

        const viewerRight = document.createElement('div');
        viewerRight.classList.add('viewer');
        minutespicker.appendChild(viewerRight);

        this.minutesEl = document.createElement('div');
        this.minutesEl.classList.add('minutes');
        viewerRight.appendChild(this.minutesEl);

        this.time.minutes.get().forEach((minute) => {
            const minuteEl = document.createElement('div');
            minuteEl.classList.add('minute', minute.type);
            minuteEl.textContent = minute.minute.toString().padStart(2, '0');
            this.minutesEl.appendChild(minuteEl);
        });

        return minutespicker;
    }

    handleStart(e) {
        this.isMove = true;

        this.move = this.handleMove.bind(this);
        this.end = this.handleEnd.bind(this);

        document.addEventListener('mousemove', this.move);
        document.addEventListener('touchmove', this.move, { passive: true });
        document.addEventListener('mouseup', this.end);
        document.addEventListener('touchend', this.end, { passive: true });

        const y = e.clientY ?? e.touches[0].clientY;

        this.startY = y;
        this.currentY = y;
        this.startTop = this.minutesEl.offsetTop;

        this.startTime = new Date();

        this.reset();
    }

    handleMove(e) {
        if (!this.isMove) {
            return;
        }

        const y = e.clientY ?? e.touches[0].clientY;

        this.currentMoveY = y - this.currentY;
        this.totalMoveY = y - this.startY;

        this.paint();
    }

    handleEnd() {
        if (!this.isMove) {
            return;
        }

        this.isMove = false;

        this.minutesEl.style.top = `${this.startTop}px`;

        this.endTime = new Date();
        this.elapsedTime = this.endTime.getTime() - this.startTime.getTime();
        this.pixelsPerTime = Math.abs(this.totalMoveY / this.elapsedTime);
        this.directionY = Math.sign(this.totalMoveY / this.elapsedTime);

        requestAnimationFrame(this.loop.bind(this));

        document.removeEventListener('mousemove', this.move);
        document.removeEventListener('touchmove', this.move);
        document.removeEventListener('mouseup', this.end);
        document.removeEventListener('touchend', this.end);
    }

    loop(timeStamp) {
        if (this.isMove) {
            return;
        }

        if (!this.oldTimeStamp) {
            this.oldTimeStamp = timeStamp;
        }

        this.timePassed = timeStamp - this.oldTimeStamp;
        this.oldTimeStamp = timeStamp;

        this.currentMoveY += this.pixelsPerTime * this.timePassed * this.directionY;
        this.reduction = this.reduction * this.reductionRatio;
        this.pixelsPerTime = this.pixelsPerTime - this.reduction;

        this.paint();

        if (this.pixelsPerTime < 0) {
            this.minutesEl.style.top = -100 + 'px';
            return;
        }

        requestAnimationFrame(this.loop.bind(this));
    }

    paint() {
        this.minutesEl.style.top = `${this.startTop + this.currentMoveY}px`;

        const top = this.minutesEl.offsetTop;

        if (top < -130) {
            this.minutesEl.appendChild(this.minutesEl.firstChild);
            this.time.minutes.next();
        }

        if (top > -70) {
            this.minutesEl.prepend(this.minutesEl.lastChild);
            this.time.minutes.prev();
        }

        if (top < -130 || top > -70) {
            this.minutesEl.style.top = -100 + 'px';

            this.currentY = this.currentY + this.currentMoveY;
            this.currentMoveY = 0;

            this.minutesEl.childNodes.forEach((el, i) => {
                el.classList.remove('prev-last', 'prev', 'current', 'next', 'next-last', 'hidden');
                el.classList.add(this.time.minutes.get()[i].type);
            });
        }
    }

    reset() {
        this.currentMoveY = 0;
        this.totalMoveY = 0;
        this.oldTimeStamp = null;
        this.reduction = 0.01;
        this.reductionRatio = 1.02;
    }

    destroy() {
        if (this.minutespicker) {
            this.minutespicker.remove();
        }
    }
}

class Picker {
    constructor(data) {
        Object.assign(this, data);
    }

    init() {
        this.picker = this.create();
    }

    get() {
        return this.picker;
    }

    render() {
        this.destroy();
        this.init();
    }

    create() {
        const picker = document.createElement('div');
        picker.classList.add('picker');

        const body = document.createElement('div');
        body.classList.add('body');
        picker.appendChild(body);

        this.hourspicker = new Hourspicker({
            time: this.time,
        });
        body.appendChild(this.hourspicker.get());

        this.minutespicker = new Minutespicker({
            time: this.time,
        });
        body.appendChild(this.minutespicker.get());

        const footer = document.createElement('footer');
        footer.classList.add('flex', 'padding-sm', 'justify-end', 'gap-xs', 'flex-wrap');
        picker.appendChild(footer);

        this.cancelBtn = document.createElement('button');
        this.cancelBtn.textContent = 'Cancel·lar';
        this.cancelBtn.ariaLabel = 'Cancel·lar';
        this.cancelBtn.classList.add('btn', 'btn--subtle');
        this.cancelBtn.addEventListener('click', () => {
            this.onCancel();
        });
        footer.appendChild(this.cancelBtn);

        this.acceptBtn = document.createElement('button');
        this.acceptBtn.textContent = 'Aceptar';
        this.acceptBtn.ariaLabel = 'Aceptar';
        this.acceptBtn.classList.add('btn', 'btn--primary');
        this.acceptBtn.addEventListener('click', () => {
            this.onAccept();
        });
        footer.appendChild(this.acceptBtn);

        return picker;
    }

    destroy() {
        if (this.picker) {
            this.picker.remove();
        }
    }
}

export default Picker;
