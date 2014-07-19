var tree    = require('markdown-tree')
var cheerio = require('cheerio')
var marked  = require('marked')
var path    = require('path')
var fs      = require('fs')

var examples = tree(
  fs.readFileSync(path.join(__dirname, 'examples.md'), 'utf8')
).children[0]
 .children
 .map(function(example, i) {
   var tokens = example.tokens.slice()
   tokens.links = {}

   var thumb = null
   var $     = cheerio.load(
     marked.Parser.parse(tokens)
   )

   $('img').each(function(i, img) {
     var $img = $(img)
     thumb = $img.attr('src')
     $img.parent().remove()
   })

   var html = $.html()
   var head = cheerio.load(marked(example.text))
   var link = head('a')
   var feat = !!head('em').length

   return {
       name: link.text()
     , link: link.attr('href')
     , desc: feat && html.trim() || ''
     , thumb: thumb
     , featured: feat
     , i: i
   }
 })
 .sort(function(a, b) {
   if (a.featured) return -1
   if (b.featured) return +1
  return a.i - b.i
 })

fs.writeFileSync(__dirname + '/../build/examples.json'
  , JSON.stringify(examples, null, 2)
)
