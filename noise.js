var ctx = new AudioContext();
var channels = 2;
var noisenode = (ctx.createScriptProcessor ||
                 ctx.createJavaScriptNode)
    .call(ctx, 2048, 0, channels);
noisenode.onaudioprocess = out;
noisenode.connect(ctx.destination);

var ch = [];
for (var i=0; i<channels; i++) {
    ch[i] = { pinken: pinken(), integrate: integrate(), diff: diff() }; /* instantiate */
}

function out (ev) {
    for(var i=0; i<channels; i++)
        fill(ev.outputBuffer.getChannelData(i), ch[i]);
}

var noises = [
    { name: 'Unnamed', slope: '-9', bg: '#480', pink: true, diff: false, sum: true, gain: 0.2 },
    { name: 'Brown', slope: '-6', bg: '#840', pink: false, diff: false, sum: true, gain: 0.2 },
    { name: 'Pink', slope: '-3', bg: '#f8d', pink: true, diff: false, sum: false, gain: 0.2 },
    { name: 'White', slope: '0', bg: '#fff', pink: false, diff: false, sum: false, gain: 0.1 },
    { name: 'Blue', slope: '+3', bg: '#04f', pink: true, diff: true, sum: false, gain: 0.9 },
    { name: 'Violet', slope: '+6', bg: '#80f', pink: false, diff: true, sum: false, gain: 0.4 },
    { name: 'Rainbow', slope: 'NaN', bg: 'url(rainbow.svg) no-repeat', pink: false, diff: false, sum: false, gain: 0 },

];

var noise = noises[7]; /* start with silence */

function fill(buf, ch) {
    for (var i=0; i<buf.length; i++) {
	var w = Math.random()*2-1;
	if (noise.pink)
	    w = ch.pinken(w);
	if (noise.sum)
	    w = ch.integrate(w);
	if (noise.diff)
	    w = ch.diff(w);
	buf[i] = w*noise.gain;
	/* just in case */
	if (buf[i] > 1)
	    buf[i] = 1;
	if (buf[i] < -1)
	    buf[i] = -1;

    }
}

function integrate () {
    return (function() {
	var s = 0;
	return function(i) {
	    s += i;
	    s *= 0.995;
	    return s/15;
	}
    })();
};

function diff () {
    return (function() {
	var s = 0;
	return function(i) {
	    var k= (s-i)* 0.995;
	    s = i;
	    return k;
	}
    })();
};

function pinken() {
    return (function() {
	/* Pinking filter. See http://musicdsp.org/files/pink.txt */
	var b = [ 0,0,0,0,0,0,0 ];
	var p = [ 0.99886, 0.99332, 0.969, 0.8665, 0.55, -0.7616 ];
	var q = [ 0.0555179, 0.0750759, 0.153852, 0.3104856, 0.5329522, -0.016898 ];
	
	return function(i) {
	    for (var n=0; n<6; n++) {
		b[n] *= p[n]; b[n] += i * q[n];
		k += b[n];
	    }
	    var k = b[0] + b[1] + b[2] + b[3] + b[4] + b[5] + b[6] + i * 0.5362;
	    
	    b[6] = i * 0.115926;
	    return k/8;
	};
    })();
}

/* here endeth all the noisy bits */

var used = {};
var nyanning = false;

function select(i) {
    noise = noises[i];
    used[i] = true;
    try {
	if (Object.keys(used).length >= noises.length-1) {
	    document.querySelector('label:last-of-type').style.display = null;
	    Nyan.init(); /* prefetch */
	}
    } catch(e) {}

    var mmm = !noise.gain;
    if (!mmm) {
	try {
	    localStorage.setItem('noisetype', i);
	} catch (e) {}
    }
    if (nyanning === mmm)
	return;
    nyanning = mmm;

    if (nyanning) {
	//noisenode.disconnect();
	try {
	    var v = document.querySelector('input[type=radio]:checked + label > .expl');
	    v.innerHTML = v.innerHTML.replace('NaN','NYAN');
	} catch(e) {}
	try { Nyan.start(); } catch(e) {}
	try { nyanim.start(); } catch(e) {}
    } else {
	try { Nyan.stop(); } catch(e) {}
	try { nyanim.stop(); } catch(e) {}
	//noisenode.connect(ctx.destination);
    }
}

{
    var n;
    function validate(i) {
	if (!i && i!==0)
	    return false;
	if (i<0 || i>=noises.length-1)
	    return false;
	return true;
    }

    try {
	n = localStorage.getItem('noisetype');
    } catch(e) {}

    if (!validate(n))
	n=3;
    noise = noises[n];
    select(n);
}

var chooser = document.body;
for (var i=0; i<noises.length; i++) {
    var input = document.createElement('input');
    input.type = 'radio';
    input.name = 'noise';
    var id ='n'+i;
    input.id = id;
    input.value = i;
    input.checked = noise == noises[i];
    (function(i) {input.addEventListener('click', function() { select(i); }, false); })(i);
    chooser.appendChild(input);
    var label = document.createElement('label');
    label.htmlFor = id;
    var name = noises[i].name;
    var expl = noises[i].slope+' dB/octave';
    var nyanvas = noises[i].gain ? '' : '<canvas id=nyanvas width=240 height=240></canvas>';

    label.innerHTML = '<div class=col style="background: '+noises[i].bg+'"></div>' +
	'<div class=name>'+name+"</div>"+
	'<div class=expl>'+expl+"</div>"+
	nyanvas;
    if (nyanvas)
	label.style.display = 'none';

    chooser.appendChild(label);
}

document.querySelector('input[type=radio]:checked + label').scrollIntoView();
