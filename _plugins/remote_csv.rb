require 'open-uri'
require 'csv'
require 'fileutils'

module Jekyll
  module RemoteCsv
    class Generator < ::Jekyll::Generator
      priority :low

      # Add a csv from the site config to the site.data
      def generate(site)
        return unless site.config['remote_csv']
        csv_string = URI.open(site.config['remote_csv']).read rescue nil
        csv_data = CSV.parse(csv_string, headers: true).map(&:to_hash) if csv_string
        if csv_data
          docs = []
          # the map for index => original instrument values
          instr_map = {}
          site.data['cornetto'] = csv_data
          site.data['cornetto'].each do |row|
            doc = {}

            doc["id"] = row["id"]
            doc["coeff"] = row["coeff"]
            doc["rism_no"] = row["rism-no"]
            doc["record_type"] = row["record-type"]
            doc["source_type"] = row["source-type"]
            doc["composer"] = row["composer"]
            doc["title"] = row["title"]

            instr = row["instruments"].split(", ") rescue []
            normalized_instr = instr.map do |s|
              s_cleaned = s.rstrip.gsub(/[()]/, '_')  # remove ( and )
              s_cleaned.gsub(/[ -]/, '_')           # replace space or dash with _
            end
            instr.each do |s|
              s_cleaned = s.rstrip.gsub(/[()]/, '_')  # remove ( and )
              key = s_cleaned.gsub(/[ -]/, '_') 
              instr_map[key] = s.rstrip
            end
            doc["instr"] = normalized_instr

            doc["libraries"] = row["libraries"]
            doc["shelfmark"] = row["shelfmark"]
            doc["accuracy"] = row["accuracy"]
            doc["notes"] = row["notes"]
            doc["work_needed"] = row["work-needed"]

            docs << doc
          end
          Jekyll.logger.info "Generator:", "File cornetto-database.json written"
          File.write("index/cornetto-database.json", docs.to_json)
          File.write("index/cornetto-instr-map.json", instr_map.to_json)
        end
      end
    end
  end
end

Jekyll::Hooks.register :site, :post_write do |site|
  files_to_copy = ["cornetto-database.json", "cornetto-instr-map.json"]
  files_to_copy.each do |fname|
    source_file = File.join(site.source, 'index', fname)
    target_file = File.join(site.dest, fname)

    if File.exist?(source_file)
      FileUtils.cp(source_file, target_file)
      Jekyll.logger.info "PostWrite:", "Copied #{source_file} to #{target_file}"
    else
      Jekyll.logger.warn "PostWrite:", "Source file #{source_file} not found; nothing copied."
    end
  end
end
