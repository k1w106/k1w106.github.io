# _plugins/toc_filter.rb

module Jekyll
  module TocFilter
    def toc_only(html)
      doc = Kramdown::Document.new(html, { input: 'html' })
      return doc.to_html(1)
    end
  end
end

Liquid::Template.register_filter(Jekyll::TocFilter)
