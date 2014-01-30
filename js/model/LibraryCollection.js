/**
 * Stores folios.
 * Parse is used when testing on the desktop without the API, otherwise the constructor is passed a list of folios from the API.
 */

var ADOBE = ADOBE || {};

ADOBE.LibraryCollection = Backbone.Collection.extend({
	parse: function(xml) {
		var issueNodes = xml.getElementsByTagName("issue");
		var len = issueNodes.length;
		if (len > 0) {
			var issues = [];
			for (var i = 0; i < len; i++) {
				var issueNode = issueNodes[i];
				// Get the attributes
				var issue = {};
				var attributes = issueNode.attributes;
				issue.id = attributes.getNamedItem("id").value;
				
				// This shouldn't happen but if productId is empty then assign one.
				issue.productId = attributes.getNamedItem("productId") ? attributes.getNamedItem("productId").value : ADOBE.LibraryCollection.productIdCounter++;
				issue.formatVersion = attributes.getNamedItem("formatVersion").value;
				issue.version = attributes.getNamedItem("version").value;
				issue.subpath = attributes.getNamedItem("subpath").value;
				issue.hasSections = attributes.getNamedItem("hasSections") ? attributes.getNamedItem("hasSections").value == "true" : false;
				
				// Loop through the nodes.
				var childNodes = issueNode.childNodes;
				var numNodes = childNodes.length;
				for (var j = 0; j < numNodes; j++) {
					var childNode = childNodes[j];
					if (childNode.nodeType == 1) {
						var nodeName = childNode.nodeName;
						if (nodeName == "libraryPreviewUrl") {
							issue[nodeName] = $.trim(childNode.firstChild.nodeValue);
						} else if (childNode.nodeName == "publicationDate") {
							// 2011-06-22T07:00:00Z.
							var pubDate = childNode.firstChild.nodeValue.split("-");
							var date = new Date(pubDate[0], Number(pubDate[1]) - 1, pubDate[2].substr(0, 2));
							issue[nodeName] = date;
						} else if (childNode.nodeName == "magazineTitle") { // Make the property match the API.
							issue["title"] = childNode.firstChild.nodeValue;
						} else if (childNode.nodeName == "issueNumber") { // Make the property match the API.
							issue["folioNumber"] = childNode.firstChild.nodeValue;
						} else {
							issue[nodeName] = childNode.firstChild.nodeValue;
						}
					}
				}
				
				// This shouldn't happen but if the publicationDate is empty then assign one.
				if (issue.publicationDate == undefined)
					issue.publicationDate = new Date();
				
				issues.push(issue);
			}

			issues.sort(this.sortDatesDescending);

			return issues;
		}
		else
		{
			return null;
		}
	},
	
	sortDatesDescending: function (a, b) {
		if (a.publicationDate < b.publicationDate)
			return 1;
		else if (a.publicationDate > b.publicationDate)
			return -1;
		else
			return 0;
	}
});

// Used in the cases of a missing product id when loading the xml on the desktop.
ADOBE.LibraryCollection.productIdCounter = 1;

