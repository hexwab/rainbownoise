var Nyan = (function(ctx) {
    var failed = false;

    var bufs = [];

    var load = (function() {
	var n=0;
	
	return function(i, url, count, cb) {
	    {
		var request = new XMLHttpRequest();
		request.open("GET", url, true);
		request.responseType = "arraybuffer";
		
		request.onload = function()
		{
		    ctx.decodeAudioData(request.response, function(buffer)
					{
					    bufs[i] = buffer;
					    if (++n == count) {
						inited = true;
						cb&&cb();
					    }
					}, function(e){failed = true;});
		};
		request.onerror = function() { failed = true; };
		request.send();
	    }
	}
    })();
    
    function init() {
	var files = [];
	for (var i=0; i<10; i++) files[i] = 'nyan/'+String.fromCharCode(i+97)+'.opus';
	
	for (var i=0; i<files.length; i++) {
	    load(i, files[i], files.length, wantstart?start:null);
	}
    }
    
    var seq = [ 0,1,2,1,4,5,6,7,6,8,9,5,6,7,6,8,3 ];
    var seqptr = 0;
    var last;
    
    var dst;
    var inited = false;
    var wantstart = false;

    function start() {
	if (failed) {
	    console.log("NYAN FAIL");
	    return;
	}
	if (!inited) {
	    wantstart = true;
	    init();
	    return;
	}

	/* a no-op node just so we can disconnect all the sources simultaneously */
	dst = ctx.createGain(); 
	dst.connect(ctx.destination);
	var ct = ctx.currentTime;
	last = ct+.1; /* start immediately */
	/* queue some buffers */
	next();
	next();
	next();
    }
    
    function stop() {
	try { dst.disconnect(); } catch(e) {}
    }
    
    function next() {
	var ct = ctx.currentTime;
	var q = ctx.createBufferSource();
	q.buffer = bufs[seq[seqptr++]];
	if (seqptr == seq.length) seqptr=0;
	q.connect(dst);
	q.onended = next;
	q.start(last);
	last += q.buffer.length/q.buffer.sampleRate;
    }
    
    return { init: init, start: start, stop: stop };
})(ctx);
