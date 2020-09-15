var canvas = document.getElementById("canvas");

window_width = window.innerWidth;
window_height = window.innerHeight;
console.log("Canvas width : " + window_width);
console.log("Canvas height : " + window_height);

function getPosition(obj) {
    var curleft = 0, curtop = 0;
    if (obj.offsetParent) {
        do {
            curleft += obj.offsetLeft;
            curtop += obj.offsetTop;
        } while (obj = obj.offsetParent);
        return { x: curleft, y: curtop };
    }
    return undefined;
}

function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: (evt.clientX - rect.left) / (rect.right - rect.left) * canvas.width,
        y: (evt.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height
    };
}

function rgbToHex(r, g, b) {
    if (r > 255 || g > 255 || b > 255)
        throw "Invalid color component";
    return ((r << 16) | (g << 8) | b).toString(16);
}

function hexToRGB(h) {
    let r = 0, g = 0, b = 0;

    // 3 digits
    if (h.length == 4) {
        r = "0x" + h[1] + h[1];
        g = "0x" + h[2] + h[2];
        b = "0x" + h[3] + h[3];

        // 6 digits
    } else if (h.length == 7) {
        r = "0x" + h[1] + h[2];
        g = "0x" + h[3] + h[4];
        b = "0x" + h[5] + h[6];
    }

    // return "rgb(" + +r + "," + +g + "," + +b + ")";
    return [r, g, b];
}

const hextorgb = hex =>
    hex.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i
        , (m, r, g, b) => '#' + r + r + g + g + b + b)
        .substring(1).match(/.{2}/g)
        .map(x => parseInt(x, 16))



function rgbToHsv(r, g, b) {
    r = r / 255, g = g / 255, b = b / 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, v = max;

    var d = max - min;
    s = max == 0 ? 0 : d / max;

    if (max == min) {
        h = 0; // achromatic
    } else {
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return [h, s, v];
}

function drawImageFromWebUrl(sourceurl) {
    var img = new Image();
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    img.addEventListener("load", function () {
        canvas.getContext("2d").drawImage(img, 0, 0, img.width, img.height, 0, 0, canvas.width, canvas.height);

    });

    img.setAttribute("src", sourceurl);
    console.log("Image width : " + img.width);
    console.log("Image height : " + img.height);
}


drawImageFromWebUrl(image_base64);

var c1 = [0, 0, 0],
    c2 = [30, 30, 30],
    c3 = [90, 0, 0],
    distance = function (v1, v2) {
        var i,
            d = 0;

        for (i = 0; i < v1.length; i++) {
            d += (v1[i] - v2[i]) * (v1[i] - v2[i]);
        }
        return Math.sqrt(d);
    };



function hsv_distance(hsv1, hsv2) {

    var h1 = hsv1[0];
    var s1 = hsv1[1];
    var v1 = hsv1[2];

    var h2 = hsv2[0];
    var s2 = hsv2[1];
    var v2 = hsv2[2];


    var hsv_distance = Math.pow((Math.sin(h1) * s1 * v1 - Math.sin(h2) * s2 * v2), 2) + Math.pow((Math.cos(h1) * s1 * v1 - Math.cos(h2) * s2 * v2), 2) + Math.pow((v1 - v2), 2);
    hsv_distance = Math.sqrt(hsv_distance);

    return hsv_distance;
};

var hsv_max = hsv_distance([0, 0, 0], [359, 1, 1]);
var rgb_max = distance([0, 0, 0], [255, 255, 255]);



canvas.addEventListener("mousemove", function (e) {
    var pos = getPosition(this);
    var new_pos = getMousePos(canvas, e);
    var x = e.pageX - pos.x;
    var y = e.pageY - pos.y;
    var coord = "x=" + x + ", y=" + y;
    var c = this.getContext('2d');

    var p = c.getImageData(new_pos.x, new_pos.y, 1, 1).data;

    // If transparency on the image
    if ((p[0] == 0) && (p[1] == 0) && (p[2] == 0) && (p[3] == 0)) {
        coord += " (Transparent color detected, cannot be converted to HEX)";
    }

    var hex = "#" + ("000000" + rgbToHex(p[0], p[1], p[2])).slice(-6);
    var hsv = "[" + rgbToHsv(p[0], p[1], p[2]).toString() + "]";
    var rgb = "[" + p[0].toString() + "," + p[1].toString() + "," + p[2].toString() + "]";

    // var original_colors_list = hexToRGB("#EB8E8B");
    var discontinuation_colour = '#666666';
    var clr_to_keep = ["#EB8E8B", discontinuation_colour, "#DD3C75", "#D1D69C", "#F0D1E1", "#E7EC96", "#D0EBBD",
        "#C1E7BD", "#EFB36E", "#F2CFD5", "#D8C965", "#8FB1C4", "#E18A86", "#F5FBB4",
        "#BE91BE", "#CFA9BB", "#F9B562", "#E6E5C1",
        "#FFED6F", "#B6DC68", "#C8B291", "#C499C5", "#C8C5D3", "#DFEBA3", "#5c360a", "#d51010"];

    // let's make the mapping between colours and treatment names : 
    var trt_clr_mapping = { "#EB8E8B": "DPP-4i", "#DD3C75": "DPP-4i + BG", "#D1D69C": "DPP-4i + SU + BG", "#F0D1E1": "DPP-4i + SU", "#E7EC96": "DPP-4i + BG + SGLT-2i", "#D0EBBD": "DPP-4i + SGLT-2i", "#C1E7BD": "DPP-4i + BG + TZD", "#EFB36E": "BG", "#F2CFD5": "other treatment", "#D8C965": "DPP-4i + a-GI", "#8FB1C4": "Insulin", "#E18A86": "BG + SGLT-2i", "#F5FBB4": "Glinides", "#BE91BE": "SU", "#CFA9BB": "SGLT-2i", "#F9B562": "a-GI", "#E6E5C1": "DPP-4i + TZD", "#FFED6F": "DPP-4i + Glinides", "#B6DC68": "TZD", "#C8B291": "SU + BG", "#C499C5": "a-GI + BG", "#C8C5D3": "DPP-4i + a-GI + BG", "#DFEBA3": "DPP-4i + SU + BG + SGLT-2i", '#666666': "Discontinuation"};


    // this is using the Euclidean Distance as Similarity function :
    var euclidean_min_dist = distance(hexToRGB(clr_to_keep[0]), [p[0], p[1], p[2]]);
    var euclidean_closest_colour = "";
    var euclidean_min_index = 0;
    clr_to_keep.forEach(function (euclidean_item, euclidean_index) {
        euclidean_temp_distance = distance(hexToRGB(euclidean_item), [p[0], p[1], p[2]]);
        if (euclidean_temp_distance < euclidean_min_dist) {
            euclidean_min_dist = euclidean_temp_distance;
            euclidean_min_index = euclidean_index;
        }
    });
    euclidean_closest_colour = clr_to_keep[euclidean_min_index];
    normalized_rgb_min_dist = euclidean_min_dist / rgb_max;



    var list_first_value_RGB = [+hexToRGB(clr_to_keep[0])[0], +hexToRGB(clr_to_keep[0])[1], +hexToRGB(clr_to_keep[0])[2]];
    var list_first_value_HSV = rgbToHsv(list_first_value_RGB[0], list_first_value_RGB[1], list_first_value_RGB[2]);
    var min_dist = hsv_distance(rgbToHsv(p[0], p[1], p[2]), list_first_value_HSV);
    var closest_colour = "";
    var min_index = 0;
    clr_to_keep.forEach(function (item, index) {
        // var temp_distance = distance(hexToRGB(item), [p[0], p[1], p[2]]);
        var temp_list_first_value_RGB = [+hexToRGB(item)[0], +hexToRGB(item)[1], +hexToRGB(item)[2]];
        var temp_list_first_value_HSV = rgbToHsv(temp_list_first_value_RGB[0], temp_list_first_value_RGB[1], temp_list_first_value_RGB[2]);
        var temp_distance = hsv_distance(rgbToHsv(p[0], p[1], p[2]), temp_list_first_value_HSV);
        if (temp_distance < min_dist) {
            min_dist = temp_distance;
            min_index = index;
        }
    });
    closest_colour = clr_to_keep[min_index];
    normalized_hsv_min_dist = min_dist / hsv_max;
    // document.getElementById("normalized_rgb").innerHTML = normalized_rgb_min_dist;
    // document.getElementById("normalized_hsv").innerHTML = normalized_hsv_min_dist;


    // now let's display the treatment name :
    var treatment = trt_clr_mapping[closest_colour];

    
    // Now let's show the treatment name on mouse move --> on the Image :
    var hover_text = document.getElementById("hover_text");

    // Position of the DIV :
    var parent_offset_left = this.offsetLeft;
    var parent_offset_top = this.offsetTop;
    var relX = e.pageX - parent_offset_left;
    var relY = e.pageY - parent_offset_top;

    hover_text.style.position = "absolute";
    hover_text_X = e.pageX + 20;
    hover_text_Y = e.pageY - 20;
    hover_text.style.left = hover_text_X+'px';
    hover_text.style.top = hover_text_Y+'px';
    hover_text.innerHTML = treatment;
    hover_text.style.display = 'block';


    // If we need to hide the text when out of Canvas Image --> implement onEvenetListener for the document.
    // the image will no longer send events to the mouse when we're out of Canvas box : 
    // if(Math.round(new_pos.x) > canvas.width - 2 ||  Math.round(new_pos.y) > canvas.height - 2){
    //     hover_text.style.display = 'none';
    // }
    // else{
    //     hover_text.style.display = 'block';
    // }

    document.getElementById("status").innerHTML = coord;
    document.getElementById("color").style.backgroundColor = hex;
    // document.getElementById("euclidean_distance").innerHTML = euclidean_min_dist;
    document.getElementById("euclidean_distance").innerHTML = e.pageX + ", " + e.pageY;
    // document.getElementById("hsv_distance").innerHTML = min_dist;
    document.getElementById("hsv_distance").innerHTML = canvas.width + ", " + canvas.height;
    // document.getElementById("original_clr").innerHTML = hex;
    document.getElementById("original_clr").innerHTML = Math.round(new_pos.x) + ", " + Math.round(new_pos.y);
    document.getElementById("closest_clr").style.backgroundColor = closest_colour.toString();
    document.getElementById("closest_clr_hexa").innerHTML = closest_colour;
    document.getElementById("closest_clr_rgb").style.backgroundColor = euclidean_closest_colour.toString();
    document.getElementById("closest_clr_hexa_rgb").innerHTML = euclidean_closest_colour;
    document.getElementById("treatment").innerHTML = relX+", "+relY;
}, false);

