import time
from . import bipolar_aba
from . import asp
import csv

MAX_ASSUMPTIONS = 500

xs = []
ys = []
for curr_n_assumptions in range(50, MAX_ASSUMPTIONS + 1, 50):
	assumptions = set()
	for n in range(curr_n_assumptions):
		assumptions.add(bipolar_aba.Symbol(str(n)))

	framework = bipolar_aba.BipolarABAFramework(set([]), assumptions)

	test_start = time.time()
	for semantics in ['preferred', 'complete', 'set_stable', 'well_founded', 'ideal']:
		asp.compute_extensions(framework, semantics)
	result = time.time() - test_start
	print(curr_n_assumptions, result)
	xs.append(curr_n_assumptions)
	ys.append(result)

rows = zip(xs, ys)

csv_file = "results.csv" # Put path here

with open(csv_file, 'w', newline='') as file:
    writer = csv.writer(file)
    writer.writerow(['assumptions', 'time'])
    writer.writerows(rows)

print(f"CSV file '{csv_file}' created successfully.")
