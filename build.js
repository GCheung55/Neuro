#!/usr/bin/env node
var dom = require('jsdom'),
	request = require('http'),
	fs = require('fs'),
	repo = 'GCheung55/Neuro',
	build = {
		host: 'documentup.com',
		path: repo
	},
	compile = {
		host: 'documentup.com',
		path: repo + '/recompile'
	},
	writeDocs = function() {
		request.get(build).on('response', function(response) {
			var html = '';

			// read the data
			response.setEncoding('utf-8');
			response.on('data', function(chunk) {
				html += chunk;
			});
			response.on('end', function() {
				// now, create a jsdom document out of the response, injecting the extra scripts
				dom.env(html, [
					'http://ajax.googleapis.com/ajax/libs/mootools/1.4.5/mootools-yui-compressed.js',
					'js/moostrap-scrollspy.js',
					'js/docs.js'
				],
				function(errors, window) {
					var head = window.getDocument().getElement('head');

					// add custom stylesheet
					new window.Element('link', {
						href: 'css/docs.css',
						type: 'text/css',
						rel: 'stylesheet'
					}).inject(head);

					// move the scripts to the head
					window.document.getElements('.jsdom').removeClass('jsdom').inject(head);

					// fix doctype
					html = ['<!DOCTYPE html>', window.document.innerHTML].join('\n');

					// write to file.
					fs.writeFile('index.html', html, function(error) {
						if (error) {
							console.log('Failed to create index.html. ', error);
							process.exit(1);
						}
						else {
							console.log('index.html was created');
							process.exit(0);
						}
					});
				});
			})

		}).on('error', function() {
			console.log('Failed to get documentation.');
			process.exit(1);
		});
	};

// get going. compile first, then get the new docs.
request.get(compile, function() {
	// give it some time to generate
	setTimeout(writeDocs, 2000);
});
