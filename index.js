

;(function (win, doc) {
var body = doc.body,
    hammerjsSrc = 'hammer.min.js',       // Hammer库地址
    hammerStatus = (!!window.Hammer) ? 2 : 0,  // Hammer加载状态 0.none 1.loading 2.done
    hammerOnloadCallback;                 // Hammer加载完成回调
    
    window.ImageViewer =  getImageViewerH5() {
        // 样式
        var style = document.createElement('style');
        style.innerHTML = '.__image-viewer{position:fixed;z-index:1000;width:100%;height:100%;top:0;left:0;background-color:rgba(0,0,0,0.8);overflow:hidden;display:none}\
        .__image-viewer-tips{z-index:1;background:transparent;display:inline-block;font-size:18px;color:#eee;position:absolute;top:48%;width:100%;text-align:center}\
        .__image-viewer-img{-webkit-user-select:none;user-select:none;visibility:hidden;display:block;max-width:100%;max-height:100%}';
        body.appendChild(style);
        var wrap = document.createElement("div");
        wrap.className = '__image-viewer';
        wrap.innerHTML = '<div class="__image-viewer-tips">loading</div><img class="__image-viewer-img" src="" alt="" />';
        body.appendChild(wrap);
        var img = wrap.querySelector('.__image-viewer-img');
        var tips = wrap.querySelector('.__image-viewer-tips');
        
        var scale,
            _scale,
            panX,
            panY,
            _panX,
            _panY,
            wrapStyle = wrap.style,
            imgStyle = img.style,
            tipsStyle = tips.style;
            
        var tipsHide = function () {
                // Hammer未加载完，强制显示tips
                if (hammerStatus === 2) {
                    tipsStyle.display = 'none';
                }
            },
            tipsShow = function () {
                tipsStyle.display = 'block';
            };
            
        // 图片加载完自适应位置
        img.addEventListener('load', function () {
            tipsHide();
            imgStyle.visibility = 'visible';
            scale = 1;
            panX = (wrap.clientWidth - img.clientWidth) / 2;
            panY = (wrap.clientHeight - img.clientHeight) / 2;
            imgStyle.webkitTransform = "scale(1)";
            imgStyle.transform = "scale(1)";
            imgStyle.marginLeft = panX + 'px';
            imgStyle.marginTop = panY + 'px';
        });
        
        wrap.addEventListener('touchmove', function (e) {
            e.preventDefault();
        });

        wrap.addEventListener('click', function () {
            wrapStyle.display = 'none';
            img.src = '';
            tipsShow();
            imgStyle.visibility = 'hidden';
        });
        
        /**
        * 加载hammer插件
        */
        if (!hammerStatus) {
            // Hammer未加载
            jsAssetLoader({
                src: hammerjsSrc,
                success: function () {
                    hammerStatus = 2;
                    initHammer();
                }
            });
            hammerStatus = 1;
        } else if (hammerStatus === 1) {
            // Hammer正在加载中
            hammerOnloadCallback = initHammer;
        } else {
            // Hammer已加载
            hammerStatus = 2;
            initHammer();
        }
        
        function initHammer() {
            // Hammer加载完，取消强制显示tips
            if (imgStyle.visibility === 'visible') {
                tipsHide();
            }
            if (!window.Hammer) return;
            var hammer = new Hammer(img);

            // pinch
            hammer.add(new Hammer.Pinch());
            hammer.on("pinchout", function (e) {
                _scale = scale * e.scale;
                if (_scale > 8) _scale = 8;
                imgStyle.webkitTransform = "scale(" + _scale + ")";
                imgStyle.transform = "scale(" + _scale + ")";
            });
            hammer.on("pinchin", function (e) {
                _scale = scale * e.scale;
                if (_scale < 0.5) _scale = 0.5;
                imgStyle.transform = "scale(" + _scale + ")";
                imgStyle.webkitTransform = "scale(" + _scale + ")";
            });
            hammer.on("pinchend", function (e) {
                scale = _scale;
            });

            // pan
            hammer.on("panmove", function (e) {
                pan(e);
            });
            hammer.on("panend", function (e) {
                pan(e)
                panX = _panX;
                panY = _panY;
            });
        }
        
        function pan(e) {
            _panX = panX + e.deltaX
            _panY = panY + e.deltaY
            imgStyle.marginLeft = _panX + "px";
            imgStyle.marginTop = _panY + "px";
        }
        
        return function (params) {
            wrapStyle.display = 'block';
            img.src = params.url;
        };
    }
    
    function jsAssetLoader(params) {
        typeof params === 'object' || (params = {});
        if (typeof params.src !== 'string') {
             console.warn('illegal asset src');
            return;
        }
        var js = document.createElement('script');
        js.onload = function () {
            params.success && params.success(js);
        };
        js.onerror = function () {
            console.warn('asset error: ', params.src);
            params.error && params.error(js);
        };
        js.src = params.src;
        document.body.appendChild(js);
        return js;
    }
}(window, document));
