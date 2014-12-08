#!/bin/sh
gnuplot <<EOF
set title "YES THAT IS A LOGARITHMIC SCALE" font ",18" offset 0,-2
set ylabel "Download size" font ",16" offset -1,0
set logscale y
set format y "%.s%cB"
set auto x
set style data histogram
set style fill solid border -1
set terminal svg
set output "noise.svg"
set font ",13"
set ytics nomirror out font ",14.5"
set xtics center nomirror offset 2,0 font ",14.5"
#set key autotitle rowheader
set boxwidth 2
set border 3
set bmargin 3
set lmargin 12
set xrange [-0.4:2.7]
set yrange [500:1e8]
plot 'noise.data' using 2:xticlabels(1) notitle lt 6
#replot '' using 2:1 notitle
EOF