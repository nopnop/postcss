var Declaration = require('../lib/declaration');
var AtRule      = require('../lib/at-rule');
var Node        = require('../lib/node');
var Root        = require('../lib/root');
var Rule        = require('../lib/rule');

var should = require('should');

describe('Node', () => {

    describe('removeSelf()', () => {

        it('removes node from parent', () => {
            var rule = new Rule({ selector: 'a' });
            rule.append({ prop: 'color', value: 'black' });

            rule.childs[0].removeSelf();
            rule.childs.should.be.empty;
        });

    });

    describe('replace()', () => {

        it('inserts new node', () => {
            var rule = new Rule({ selector: 'a' });
            rule.append({ prop: 'color', value: 'black' });
            rule.append({ prop: 'width', value: '1px' });
            rule.append({ prop: 'height', value: '1px' });

            var node   = new Declaration({ prop: 'min-width', value: '1px' });
            var width  = rule.childs[1];
            var result = width.replace(node);

            result.should.eql(width);

            rule.toString().should.eql('a {\n' +
                                       '    color: black;\n' +
                                       '    min-width: 1px;\n' +
                                       '    height: 1px\n' +
                                       '}');
        });

        it('inserts new root', () => {
            var root = new Root();
            root.append( new AtRule({ name: 'import', params: '"a.css"' }) );

            var a = new Root();
            a.append( new Rule({ selector: 'a' }) );
            a.append( new Rule({ selector: 'b' }) );

            root.first.replace(a);
            root.toString().should.eql('a {}b {}');
        });

    });

    describe('clone()', () => {

        it('clones nodes', () => {
            var rule = new Rule({ selector: 'a' });
            rule.append({ prop: 'color', value: '/**/black', before: '' });

            var clone = rule.clone();
            clone.append({ prop: 'display', value: 'none' });

            clone.childs[0].parent.should.exactly(clone);
            rule.childs[0].parent.should.exactly(rule);

            rule.toString().should.eql('a {color: /**/black}');
            clone.toString().should.eql('a {color: /**/black;display: none}');
        });

        it('overrides properties', () => {
            var rule  = new Rule({ selector: 'a' });
            var clone = rule.clone({ selector: 'b' });
            clone.selector.should.eql('b');
        });

    });

    describe('toJSON()', () => {

        it('cleans parents inside', () => {
            var rule = new Rule({ selector: 'a' });
            rule.append({ prop: 'color', value: 'b' });

            var json = rule.toJSON();
            should.not.exists(json.parent);
            should.not.exists(json.childs[0].parent);

            JSON.stringify(rule).should.eql(
                '{"type":"rule","childs":[' +
                    '{"type":"decl","prop":"color","value":"b"}' +
                '],"selector":"a"}');
        });

    });

    describe('style()', () => {

        it('uses defaults without parent', () => {
            var rule = new Rule({ selector: 'a' });
            rule.style().should.eql({ between: ' ', after: '' });
        });

        it('uses defaults for artificial nodes', () => {
            var root = new Root();
            root.append(new Rule({ selector: 'a' }));
            root.first.style().should.eql({ between: ' ', after: '' });
        });

        it('uses nodes style', () => {
            var root = new Root();
            root.append( new Rule({ selector: 'a', between: '', after: '' }) );
            root.first.style().should.eql({ between: '', after: '' });
        });

        it('clones style from first node', () => {
            var root = new Root();
            root.append( new Rule({ selector: 'a', between: '', after: ' ' }) );
            root.append( new Rule({ selector: 'b' }) );

            root.last.style().should.eql({ between: '', after: ' ' });
        });

        it('uses different style for different node style type', () => {
            var root = new Root();
            root.append( new AtRule({ name: 'page', childs: [] }) );
            root.append( new AtRule({ name: 'import' }) );

            root.first.style().should.eql({ between: ' ', after: '' });
            root.last.style().should.eql( { between: '' });
        });

    });

    describe('stringifyRaw()', () => {
        it('creates trimmed/raw property', () => {
            var b = new Node();

            b.one  = 'trim';
            b._one = { value: 'trim', raw: 'raw' };
            b.stringifyRaw('one').should.eql('raw');

            b.one = 'trim1';
            b.stringifyRaw('one').should.eql('trim1');
        });

        it('works without magic', () => {
            var b = new Node();
            b.one = '1';
            b.one.should.eql('1');
            b.stringifyRaw('one').should.eql('1');
        });

    });

});
