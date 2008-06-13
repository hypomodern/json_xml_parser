/**
* Client Library for Parsing XML into JSON, written loosely on the Prototype js library.
*
* This is far from feature complete, but it works and suits my purposes!
*
* _N.B._ It pretty much ignores attributes on the XML, excepting when they are type hints (and it's not good at typecasting, either!).
* If attribute value is important to you, you'll have to hack that in. I haven't seen an implementation that I'm happy with, but I am
* thinking of adding a _attributes: { name: value, name: value } to each element.
*
**/
var XMLParser = Class.create({
  initialize: function(){
    this.xml_doc = null;
    this.json = null;
  },
  
  //there's a sorta-reference down there in the large comment block. This function accepts an XML object and returns JSON.
  xml_to_json: function(xdoc) {
    xdoc = (typeof xdoc != "undefined") ? xdoc : this.xml_doc;
    this.json = {};
    
    /* parsing happens! */
    /* we're going to have to get all recursive up in here, and check for nodeTypes, so here's a (meaningful) reference:
    1	ELEMENT_NODE
    3	TEXT_NODE
    4	CDATA_SECTION_NODE
    9	DOCUMENT_NODE
    
    We want the output from parsing something that looks like this:
    
    <manufacturer>
      <name>Acme</name>
      <updated-at type="datetime">2008-05-12T15:22:19-04:00</updated-at>
    </manufacturer>
    
    to be something like this:
    
    var json = {
      manufacturer: {
        name: "Acme",
        updated_at: 2008-05-12T15:22:19-04:00
      }
    }
    
    json.manufacturer.name // => "Acme"
    
    <locations type=\"array\">
      <location>
        <id type=\"integer\">2</id>
        <name>330 32nd Street</name>
        <updated-at type=\"datetime\">2008-04-15T11:51:52-04:00</updated-at>
        <level-name>Area</level-name>
      </location>
      <location>
        <id type=\"integer\">3</id>
        <name>332 32nd Street</name>
        <updated-at type=\"datetime\">2008-04-15T11:51:52-04:00</updated-at>
        <level-name>Area</level-name>
      </location>
    </locations>
    
    var json = {
      locations: {
        location: [
          { id: 2, name: "330 32nd Street", level_name: "Area", updated_at:...},
          { id: 3, name: "332 32nd Street", level_name: "Area", updated_at:...}
        ]
      }
    }
    
    json.locations.location[1].name // => "330 32nd Street"
    
    <framulator-cost>
      $32.58
    </framulator-cost>
    
    var json = { 
      framulator_cost: "$32.58"
    }
    
    json.framulator_cost // => "$32.58"
    
    */
    //determine the root:
    var root = ( xdoc.nodeType == 9 ) ? xdoc.documentElement : xdoc;
    
    //if we have a TEXT_NODE or a CDATA_SECTION_NODE, return it
    if (root.nodeType == 3 || root.nodeType == 4) {
      this.json = node_value(root);
      return this.json;
    }
    
    /* extract the value of the node, typecasting as appropriate
      TODO: add support for more types!
    */
    function node_value(node) {
      var value;
      switch(node.parentNode.getAttribute("type")) {
        case "integer":
          value = parseInt(node.nodeValue.strip());
          break;
        case "float":
        case "decimal":
          value = parseFloat(node.nodeValue.strip());
          break;
        case "date":
        case "datetime":
          //value = new Date(node.nodeValue.strip());
          //I'm getting datetimes in ISO8601 combined format, doesn't work with builtin js Dates.
          //what a bummer
          value = node.nodeValue.strip();
          break;
        default:
          value = node.nodeValue.strip().escapeHTML();
      }
      return value;
    }
    
    /* define an interior function to do the recursive parsing */
    function parse_xml(node) {
      if(typeof node == "undefined") { return null; }
      var o = {};
      
      switch(node.nodeType) {
        case 3:
        case 4:
          // text and CDATA nodes are values
          o = node_value(node);
          break;
        case 1:
          //element node
          if(node.hasChildNodes()) {
            //has childrens
            var text = "";
            var hasChildNode = false;
            for (var n=node.firstChild; n; n=n.nextSibling) {
              switch(n.nodeType) {
                case 3:
                case 4:
                  text = (text == "") ? node_value(n) : text += node_value(n);
                  break;
                default:
                  hasChildNode = true;
                  var node_name = n.nodeName.underscore();
                  if(o[node_name]) { // already have a child like this!
                    if(o[node_name] instanceof Array) { // already multiples
                      o[node_name].push(parse_xml(n));
                    } else { //first time a multiple
                      o[node_name] = [ o[node_name], parse_xml(n) ];
                    }
                  } else { //first child like this
                    o[node_name] = parse_xml(n);
                  }
              }
            }
            if (!hasChildNode) {
              o = text;
            } else {
              if(text != "") { o["#text"] = text; }
            }
          } else {
            //no child nodes.
          }
          break;
        default:
          throw new Error("Unhandled node type for " + node + " (type " + node.nodeType + ")");
      }
      return o;
    }
    //kick this process off:
    this.json = {};
    this.json[root.nodeName.underscore()] = parse_xml(root);
    
    return this.json;
  },
  
  //basic DOM creation from text via browser
  text_to_xml: function(text){
    try {
      var xml = (Prototype.Browser.IE) ? new ActiveXObject("Microsoft.XMLDOM") : new DOMParser();
      xml.async = false; //argh
    } catch(e) {
      return "Error starting a parser";
    }
    
    try {
      if(Prototype.Browser.IE) {
        this.xml_doc = (xml.loadXML(text)) ? xml : null;
      } else {
        this.xml_doc = xml.parseFromString(text, "text/xml");
      }
    } catch(e) {
      if console { console.log(e); }
      return "Error parsing the XML";
    }
    
    return this.xml_doc;
  }
});