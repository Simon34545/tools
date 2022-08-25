let img;
let canvas = document.createElement('canvas');
let ctx = canvas.getContext('2d');
canvas.width = 10;
canvas.height = 10;
canvas.style = "position: absolute; top: 260px";


document.getElementById('page').appendChild(canvas);

function removeWatermark() {
	if (!img) return;
	
	let threshold = parseInt(document.getElementById('threshold').value);
	let manual = document.getElementById('manual').checked;
	let height = parseInt(document.getElementById('height').value);
	
	canvas.width = img.width;
	canvas.height = img.height;
	
	if (manual) {
		canvas.height = img.height - height;
		ctx.drawImage(img, 0, 0, img.width, img.height - height, 0, 0, img.width, img.height - height);
	} else {
		ctx.drawImage(img, 0, 0);
		let imgdata = ctx.getImageData(0, 0, img.width, img.height);
		let line = img.height - 1;
		
		while (true) {
			let color1Found = false;
			let color2Found = false;
			
			for (let x = 0; x < img.width; x++) {
				let idx = (line * img.width) + x;
				let r = imgdata.data[idx * 4 + 0];
				let g = imgdata.data[idx * 4 + 1];
				let b = imgdata.data[idx * 4 + 2];
				
				let color1Dist = Math.sqrt(Math.abs(r -  23) ** 2 + Math.abs(g -  23) ** 2 + Math.abs(b -  23) ** 2);
				let color2Dist = Math.sqrt(Math.abs(r - 255) ** 2 + Math.abs(g - 206) ** 2 + Math.abs(b -  69) ** 2);
				
				if (color1Dist < threshold) color1Found = true;
				if (color2Dist < threshold) color2Found = true;
			}
			
			if (!color1Found || !color2Found) break;
			
			line--;
		}
		
		canvas.height = line;
		ctx.drawImage(img, 0, 0, img.width, line, 0, 0, img.width, line);
	}
}

function handleFileUpload(file) {
	img = new Image();
	img.onload = removeWatermark;
	img.src = file.target.result;
}

document.getElementById('file').addEventListener('change', function(e) {
	let f = e.target.files[0];
	
	if (!f) return;
	
	if (!f.type.match('image.*')) {
		return;
	}

	let reader = new FileReader();

	reader.onload = handleFileUpload;
	
	reader.readAsDataURL(f);
});

document.getElementById('page').addEventListener('dragover', function(e) {
	e.stopPropagation();
  e.preventDefault();
  e.dataTransfer.dropEffect = 'copy';
});

document.getElementById('page').addEventListener('drop', function(e) {
	e.stopPropagation();
  e.preventDefault();
	
  let f = e.dataTransfer.files[0];
	
	if (!f) return;
	
	if (!f.type.match('image.*')) {
		return;
	}

	let reader = new FileReader();

	reader.onload = handleFileUpload;
	
	reader.readAsDataURL(f);
});

document.onpaste = function(e){
  let items = (e.clipboardData || e.originalEvent.clipboardData).items;
  
  for (let i = 0; i < items.length; i++) {
    let item = items[i];
		
    if (item.kind === 'file') {
      let file = item.getAsFile();
			
      let reader = new FileReader();
			
      reader.onload = handleFileUpload;
			
      reader.readAsDataURL(file);
    }
  }
}

document.getElementById('threshold').addEventListener('change', removeWatermark);
document.getElementById('manual').addEventListener('change', removeWatermark);
document.getElementById('height').addEventListener('change', removeWatermark);