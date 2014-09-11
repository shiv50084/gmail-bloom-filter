#include <stdio.h>
#include <stdbool.h>
#include <stdlib.h>
#include <string.h>
#include <getopt.h>
#include "bloom.h"

static void filter_fill(struct bloom *filter, FILE *in)
{
    char line[128];
    while (!feof(stdin)) {
        if (fgets(line, sizeof(line), in)) {
            line[strlen(line) - 1] = '\0';
            bloom_insert(filter, line);
        }
    }
}

int main(int argc, char **argv)
{
    size_t n_expected = 4929090;
    double p = 0.05;
    struct bloom filter;
    const char *dumpfile = "filter.bloom";
    bool create = false;

    int opt;
    while ((opt = getopt(argc, argv, "cd:p:n:")) != -1) {
        switch (opt) {
        case 'c':
            create = true;
            break;
        case 'd':
            dumpfile = optarg;
            break;
        case 'p':
            p = strtod(optarg, NULL);
            break;
        case 'n':
            n_expected = strtol(optarg, NULL, 10);
            break;
        default:
            abort();
        }
    }

    if (create) {
        bloom_init(&filter, n_expected, p);
        printf("m=%zu (%.0f kB), k=%d, p=%f\n",
               filter.nbits, filter.nbytes / 1024.0, filter.k, p);
        filter_fill(&filter, stdin);
        printf("p_actual = %f\n", bloom_error_rate(&filter));
        bloom_save(&filter, dumpfile);
    } else {
        bloom_load(&filter, dumpfile);
        printf("m=%zu (%.0f kB), k=%d\n",
               filter.nbits, filter.nbytes / 1024.0, filter.k);
        for (int i = optind; i < argc; i++)
            printf("%s => %d\n", argv[i], bloom_test(&filter, argv[i]));
    }

    bloom_destroy(&filter);
    return 0;
}
