class IconButton {
    constructor(data) {
        Object.assign(this, data);
        this.init();
    }

    init() {
        this.iconButton = this.create();
    }

    get() {
        return this.iconButton;
    }

    create() {
        const iconButton = document.createElement("button");

        iconButton.type = this.type ?? "button";
        iconButton.ariaLabel = this.ariaLabel ?? "";
        iconButton.disabled = this.disabled ?? false;

        iconButton.classList.add("btn--icon");
        if (this.classes) {
            this.classes.trim().split(' ').forEach(item => iconButton.classList.add(item));
        }

        switch (this.buttonSize) {
            case "small":
                iconButton.classList.add("text-xs");
                break;
            case "medium":
                iconButton.classList.add("text-md");
                break;
            case "large":
                iconButton.classList.add("text-lg");
                break;
            case "xl":
                iconButton.classList.add("text-xl");
                break;
            default:
                iconButton.classList.add("text-md");
                break;
        }

        let sizeIconClass;
        switch (this.svgSize) {
            case "xs":
                sizeIconClass = "icon--xs";
                break;
            case "small":
                sizeIconClass = "icon--sm";
                break;
            case "medium":
                sizeIconClass = "icon--md";
                break;
            case "large":
                sizeIconClass = "icon--lg";
                break;
            case "xl":
                sizeIconClass = "icon--xl";
                break;
            default:
                sizeIconClass = "icon--md";
                break;
        }

        iconButton.addEventListener("click", (e) => {
            e.stopPropagation();
            this.onClick();
        });
        iconButton.addEventListener("mousedown", (e) => e.stopPropagation());
        iconButton.addEventListener("touchstart", (e) => e.stopPropagation(), { passive: true });
        iconButton.addEventListener("mousemove", (e) => e.stopPropagation());

        iconButton.appendChild(this.icon);
        if (iconButton.children[0]) {
            iconButton.children[0].classList.add(sizeIconClass);
        }

        return iconButton;
    }
}

export default IconButton;
