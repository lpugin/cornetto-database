# List of common instruments
instruments = %w[
  vl va vc db pno fl ob cl bn tr hn tbn tba
]

# Method to generate a random distribution of instruments
def random_instrument_distribution(instruments, min_size = 1, max_size = 5)
  distribution_size = rand(min_size..max_size)
  instruments.sample(distribution_size).join(', ')
end

# Generate 1000 random distributions
distributions = 1000.times.map do
  random_instrument_distribution(instruments)
end

# Print the distributions
distributions.each_with_index do |distribution, index|
  puts "#{distribution}"
end