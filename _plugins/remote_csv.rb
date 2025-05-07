require 'open-uri'
require 'csv'
require 'fileutils'

module Jekyll
  module RemoteCsv
    class Generator < ::Jekyll::Generator
      priority :low

      puts "Running Jekyll::Generator"

      # Add a csv from the site config to the site.data
      def generate(site)
        return unless site.config['remote_csv']
        site.config['remote_csv'].each do |source_name, conf|
          csv_string = URI.open(conf['source']).read rescue nil
          csv_data = CSV.parse(csv_string, headers: true).map(&:to_hash) if csv_string
          if csv_data
            docs = []
            site.data[source_name] = csv_data
            site.data[source_name].each do |row|
              doc = {}
              doc["id"] = row["ref"]
              doc["body"] = row["title"]
              doc["composer"] = row["composer"]
              # add the instrument from CSV
              # instr = $instr.find {|row| row[0] == doc["id"]}
              instr = row["instruments"].split(", ") rescue []
              doc["instr"] = instr.map { |s| s.gsub(/\s*\(.*/, '') }
              docs << doc
            end
            puts "Writing cornetto-database.json"
            File.write("index/cornetto-database.json", docs.to_json)
          end
        end
      end
    end
  end
end

Jekyll::Hooks.register :site, :post_write do |site|
  source_file = File.join(site.source, 'index', 'cornetto-database.json')
  target_file = File.join(site.dest, 'cornetto-database.json')

  if File.exist?(source_file)
    FileUtils.cp(source_file, target_file)
    Jekyll.logger.info "PostWrite:", "Copied #{source_file} to #{target_file}"
  else
    Jekyll.logger.warn "PostWrite:", "Source file #{source_file} not found; nothing copied."
  end
end
