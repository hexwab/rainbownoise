#!/bin/sh

#individual wav files (deprecated)
#<nyan2.wav perl -e '$/=\44; $h = <>; $/ = \(37312*2); while (<>) { open my $f,">",(sprintf"%02d.wav",++$n);print $f $h.$_ }' 
#for i in ??; do opusenc --padding 0 --serial 0 --bitrate 48 $i.wav $i.opus;done 
#for i in ??; do opusdec $i.opus $i.out;done 

#raw files, plus header
<nyan2.wav perl -e '$/=\44; $h = <>; {open my $f, ">wavhead"; print $f $h; } $/ = \(37312*2); while (<>) { open my $f,">",(sprintf"%02d.raw",++$n);print $f $_ }' 

#a: 1,
#b: 2,3,4,5,6,7,8, 9,10,11,12,13,14,15,
#c: 16, 17,
#b: 2,3,4,5,6,7,8, 9,10,11,12,13,14,15,
#e: 32,

#f: 33,
#g: 34,
#h: 35,36,37,38,39,40, 41,
#g: 34,
#i: 43,44,45,46,47,

#j: 48,
#f: 33,
#g: 34,
#h: 35,36,37,38,39,40, 41,
#g: 34,
#i: 43,44,45,46,47,
#d: 64


# yes these are truncated compared to what the header says, but opusenc doesn't care.
cat wavhead 01.raw > a.wav
cat wavhead 02.raw 03.raw 04.raw 05.raw 06.raw 07.raw 08.raw 09.raw 10.raw 11.raw 12.raw 13.raw 14.raw 15.raw > b.wav
cat wavhead 16.raw 17.raw >c.wav
cat wavhead 32.raw >e.wav
cat wavhead 33.raw >f.wav
cat wavhead 34.raw >g.wav
cat wavhead 35.raw 36.raw 37.raw 38.raw 39.raw 40.raw 41.raw >h.wav
cat wavhead 43.raw 44.raw 45.raw 46.raw 47.raw >i.wav
cat wavhead 48.raw >j.wav
cat wavhead 64.raw >d.wav

# --serial 0 is from when I was going to store the opus header separately
for i in a b c d e f g h i j k; do opusenc --padding 0 --serial 0 --bitrate 44 $i.wav $i.opus;done 
