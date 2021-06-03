# TreatmentColor_onHover

This repo demonstrates how we can display Treatment names on Image Hover.
We first retrieve pixel value on Mouse position on the Canvas image.
then we compare these values to the predefined colours of the Treaments.

Sometimes, we apply transformations on the Image to make it more clear, like a smoothing. This operation change the pixel values and we can have slightly different colours (pixel values) from those predefined. Therefore, if the Colour values retrieved from the Canvas Container are not in the predefined list, we calculate the distance between the onMousePosition Colour and each of those predefined ones and we take the one with the minimum distance.

This is how the output look like : 

<img src="img/results.PNG">
