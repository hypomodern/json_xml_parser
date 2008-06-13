# hypomodern prototype jxparser

This is version 0.1 of a xml-to-json-to-xml parser that I am working on. I wanted something lightweight and tight, and with a MIT or similar license. I couldn't find anything that fit all of those bills, so here's the DIY version. This software is designed for use with prototype, but could easily be ported to be framework-neutral.

**This is version 0.1!** It takes XML and converts it to JSON. It ignores your attribute specifications (because I'm not sure how to handle them well and the projects I'm on don't need me to handle attributes, so...) and doesn't do a very good job typecasting. But hey, if what you need is some XML converted to JSON, it works. The file itself is littered with commentary, but here's the basics:

### What it does

The output from parsing something that looks like this:

    <manufacturer>
      <name>Acme</name>
      <updated-at type="datetime">2008-05-12T15:22:19-04:00</updated-at>
    </manufacturer>

is something like this:

    var json = {
      manufacturer: {
        name: "Acme",
        updated_at: 2008-05-12T15:22:19-04:00
      }
    }

    json.manufacturer.name // => "Acme"

More examples:

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

    json.locations.location[1].name // => "332 32nd Street"

    <framulator-cost>
      $32.58
    </framulator-cost>

    var json = { 
      framulator_cost: "$32.58"
    }

    json.framulator_cost // => "$32.58"
    
etc. etc.

Have fun!