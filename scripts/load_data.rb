require 'json'
require 'net/http'
require 'uri'
require 'csv'

$instr = CSV.read("instruments.csv")

$docs = []

# Method to fetch and parse JSON-LD data from RISM Online
def fetch_json_ld(url)
    uri = URI(url)
    request = Net::HTTP::Get.new(uri)
    # Set the Accept header to request JSON-LD
    request['Accept'] = 'application/ld+json'
    response = Net::HTTP.start(uri.hostname, uri.port, use_ssl: uri.scheme == 'https') do |http|
        http.request(request)
    end
    
    if response.is_a?(Net::HTTPSuccess)
        JSON.parse(response.body)
    else
        puts "Failed to retrieve data from #{url}: #{response.code} #{response.message}"
        nil
    end
end

# Method to iterate through JSON-LD data["items"] and to add them to the document list
def iterate_json_ld(data, indent = 0)
    data.each_with_index do |value, index|
        doc = {}
        doc["id"] = value["id"]
        doc["body"] = value["label"]["en"][0]

        # add the instrument from CSV
        instr = $instr.find {|row| row[0] == doc["id"]}
        doc["instr"] = instr[1].split(", ") rescue []
        $docs << doc
        
        #puts value["summary"]["sourceComposer"]["value"]["none"] if value["summary"]["sourceComposer"]
    end
end

# Method to iterate through paginated results
def iterate_paginated_results(start_url)
  current_url = start_url
  
  loop do
    data = fetch_json_ld(current_url)
    
    # Process the items in the current page
    puts "Processing items from #{current_url}:"
    iterate_json_ld(data["items"])

    # Check if there is a next page
    if data["view"]["next"]
        current_url = data["view"]["next"]
    else
        break
    end
  end
end

intr = CSV.read("instruments.csv")

# Starting URL for the paginated API
start_url = "https://rism.online/institutions/30000516/sources?fq=hide-source-contents%3Atrue&fq=hide-diamm-records%3Atrue"

# Start processing paginated results
iterate_paginated_results(start_url)

puts $docs
File.write("pages.json", $docs.to_json)

