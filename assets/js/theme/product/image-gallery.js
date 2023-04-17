import 'easyzoom';

export default class ImageGallery {
    constructor($gallery) {
        this.$mainImage = $gallery.find('.prodimageslider .pdpmainimage');
        this.$mainImageNested = $gallery.find('.prodimageslider .slick-current img');
        this.$selectableImages = $gallery.find('[data-image-gallery-item]');
        this.currentImage = {};
    }

    init() {
        this.bindEvents();
        this.setImageZoom();
    }

    setMainImage(imgObj) {
        this.currentImage = { ...imgObj };

        //this.setActiveThumb();
        this.swapMainImage();
    }

    setAlternateImage(imgObj) {
        if (!this.savedImage) {
            this.savedImage = {
                mainImageUrl: this.$mainImage.find('img').attr('src'),
                zoomImageUrl: this.$mainImage.attr('data-zoom-image'),
                mainImageSrcset: this.$mainImage.find('img').attr('srcset'),
                $selectedThumb: this.currentImage.$selectedThumb,
            };
        }
        this.setMainImage(imgObj);
    }

    restoreImage() {
        if (this.savedImage) {
            this.setMainImage(this.savedImage);
            delete this.savedImage;
        }
    }

    selectNewImage(e) {
        e.preventDefault();
        const $target = $(e.currentTarget);
        const imgObj = {
            mainImageUrl: $target.attr('data-image-gallery-new-image-url'),
            zoomImageUrl: $target.attr('data-image-gallery-zoom-image-url'),
            mainImageSrcset: $target.attr('data-image-gallery-new-image-srcset'),
            $selectedThumb: $target,
            mainImageAlt: $target.children().first().attr('alt'),
        };
        this.setMainImage(imgObj);
    }

    setActiveThumb() {
        this.$selectableImages.removeClass('is-active');
        if (this.currentImage.$selectedThumb) {
            this.currentImage.$selectedThumb.addClass('is-active');
        }
    }

    swapMainImage() {
        const mainImageSlider = document.querySelectorAll('.prodimageslider .pdpmainimage');
        mainImageSlider.forEach(slider => {
            if (slider.classList.contains('slick-current') && this.currentImage.zoomImageUrl !== undefined) {
                slider.querySelector('img').setAttribute('data-src', this.currentImage.mainImageUrl);
                slider.querySelector('img').setAttribute('src', this.currentImage.mainImageUrl);
                slider.querySelector('img').setAttribute('srcset', this.currentImage.mainImageUrl);
                slider.querySelector('img').setAttribute('data-srcset', this.currentImage.mainImageUrl);
            }
        });

        const imageModalSlider = document.querySelectorAll('#pdpimagemodal .prodimageslider .slick-slide');
        imageModalSlider.forEach(slider => {
            if (slider.classList.contains('slick-current')) {
                slider.querySelector('img').setAttribute('data-src', this.currentImage.mainImageUrl);
            }
        });
    }

    checkImage() {
        const $imageContainer = $('.pdpmainimage.slick-current');
        const containerHeight = $imageContainer.height();
        const containerWidth = $imageContainer.width();

        const $image = this.easyzoom.data('easyZoom').$zoom;
        const height = $image.height();
        const width = $image.width();

        if (height < containerHeight || width < containerWidth) {
            this.easyzoom.data('easyZoom').hide();
        }
    }

    setImageZoom() {
        this.easyzoom = this.$mainImage.easyZoom({
            onShow: () => this.checkImage(),
            errorNotice: '',
            loadingNotice: '',
        });
    }

    bindEvents() {
        this.$selectableImages.on('click', this.selectNewImage.bind(this));
    }
}
