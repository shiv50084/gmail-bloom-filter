# Private Gmail Leak Tester

This project packs the leaked email database into a [bloom
filter](http://en.wikipedia.org/wiki/Bloom_filter) for safe, private
offline address testing. The filter is 4MB uncompressed and contains
no actual e-mail addresses. It has a false positive rate of less than
4%. It can be found here:

* http://skeeto.github.io/gmail-bloom-filter/

The C program on the master branch generates the bloom filter. I don't
want to link to it, so you'll have to find the leak database online
yourself. The gh-pages branch contains a webapp that queries the bloom
filter in browser memory.
