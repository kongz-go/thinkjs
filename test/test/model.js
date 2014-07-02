var should = require('should');
var assert = require('assert');
var muk = require('muk');
process.argv[2] = '/'; //命中命令行模式
require('../www/index.js');

var MysqlSocket = thinkRequire('MysqlSocket');

beforeEach(function(){
  muk(MysqlSocket.prototype, 'query', function(sql){
    if(sql.indexOf('SHOW COLUMNS ') > -1){
      var data = [{"Field":"id","Type":"int(11) unsigned","Null":"NO","Key":"PRI","Default":null,"Extra":"auto_increment"},{"Field":"title","Type":"varchar(255)","Null":"NO","Key":"UNI","Default":null,"Extra":""},{"Field":"cate_id","Type":"tinyint(255)","Null":"NO","Key":"MUL","Default":"1","Extra":""},{"Field":"cate_no","Type":"int(11)","Null":"YES","Key":"","Default":null,"Extra":""},{"Field":"md5","Type":"varchar(255)","Null":"NO","Key":"","Default":null,"Extra":""},{"Field":"width","Type":"int(11)","Null":"NO","Key":"","Default":"0","Extra":""},{"Field":"height","Type":"int(11)","Null":"NO","Key":"","Default":"0","Extra":""},{"Field":"pic_nums","Type":"int(11)","Null":"NO","Key":"MUL","Default":"0","Extra":""},{"Field":"view_nums","Type":"int(11)","Null":"NO","Key":"MUL","Default":"0","Extra":""},{"Field":"content","Type":"text","Null":"NO","Key":"","Default":null,"Extra":""},{"Field":"date","Type":"int(11)","Null":"NO","Key":"MUL","Default":null,"Extra":""},{"Field":"is_hide","Type":"tinyint(11)","Null":"YES","Key":"MUL","Default":"0","Extra":""},{"Field":"is_safe","Type":"tinyint(11)","Null":"YES","Key":"MUL","Default":"1","Extra":""}];
      return getPromise(data);
    }
    return getPromise([]);
  })
});
describe('Model', function(){
  var model = D('Group');

  describe('common', function(){
    it('getModelName', function(){
      var name = model.getModelName();
      assert.equal(name, 'Group')
    })
    it('tablePrefix', function(){
      var tablePrefix = model.tablePrefix;
      assert.equal(tablePrefix, 'meinv_')
    })
    it('configKey', function(){
      model.initDb();
      assert.equal(model.configKey, '9d4568c009d203ab10e33ea9953a0264')
    })
    it('getTableName', function(){
      var getTableName = model.getTableName();
      assert.equal(getTableName, 'meinv_group')
    })
    it('getTableFields', function(done){
      model.getTableFields().then(function(data){
        assert.equal(data.join(','), 'id,title,cate_id,cate_no,md5,width,height,pic_nums,view_nums,content,date,is_hide,is_safe')
        done();
      })
    })
    it('flushFields', function(done){
      model.flushFields().then(function(data){
        assert.equal(JSON.stringify(data), '{"_field":["id","title","cate_id","cate_no","md5","width","height","pic_nums","view_nums","content","date","is_hide","is_safe"],"_autoinc":true,"_unique":["title"],"_pk":"id","_type":{"id":"int(11) unsigned","title":"varchar(255)","cate_id":"tinyint(255)","cate_no":"int(11)","md5":"varchar(255)","width":"int(11)","height":"int(11)","pic_nums":"int(11)","view_nums":"int(11)","content":"text","date":"int(11)","is_hide":"tinyint(11)","is_safe":"tinyint(11)"}}')
        done();
      })
    })
    it('getPk', function(done){
      model.getTableFields().then(function(){
        var pk = model.getPk();
        assert.equal(pk, 'id');
        done();
      })
    })
  })



  describe('select', function(){

    describe('common', function(){
      it('select all', function(done){
        model.select().then(function(){
          var sql = model.getLastSql().trim();
          assert.equal(sql, 'SELECT * FROM `meinv_group`')
          done();
        })
      })
      it('find one', function(done){
        model.find().then(function(){
          var sql = model.getLastSql().trim();
          assert.equal(sql, 'SELECT * FROM `meinv_group` LIMIT 1')
          done();
        })
      })
    })

    describe('field', function(){
      it('sql with empty field', function(done){
        model.field().select().then(function(){
          var sql = model.getLastSql().trim();
          assert.equal(sql, 'SELECT * FROM `meinv_group`');
          done();
        })
      })

      it('sql with string field', function(done){
        model.field('id, group').select().then(function(){
          var sql = model.getLastSql().trim();
          assert.equal(sql, 'SELECT `id`,`group` FROM `meinv_group`');
          done();
        })
      })

      it('sql with array field', function(done){
        model.field(['id', 'title']).select().then(function(){
          var sql = model.getLastSql().trim();
          assert.equal(sql, 'SELECT `id`,`title` FROM `meinv_group`');
          done();
        })
      })

      it('sql with reverse field', function(done){
        model.field(['id', 'title'], true).select().then(function(){
          var sql = model.getLastSql().trim();
          assert.equal(sql, 'SELECT `cate_id`,`cate_no`,`md5`,`width`,`height`,`pic_nums`,`view_nums`,`content`,`date`,`is_hide`,`is_safe` FROM `meinv_group`');
          done();
        })
      })
    })


    describe('limit', function(){
      it('sql with limit', function(done){
        model.limit(10).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT * FROM `meinv_group` LIMIT 10');
          done();
        })
      })
      it('sql with limit, length', function(done){
        model.limit(10, 20).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT * FROM `meinv_group` LIMIT 10,20');
          done();
        })
      })

      it('sql with error limit', function(done){
        model.limit('10xx').select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT * FROM `meinv_group` LIMIT 0');
          done();
        })
      })

      it('sql with error limit1', function(done){
        model.limit('10', '').select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT * FROM `meinv_group` LIMIT 10,0');
          done();
        })
      })
    })

  
    describe('page', function(){
      it('sql with page 0', function(done){
        model.page(0).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT * FROM `meinv_group` LIMIT 0,20')
          done();
        })
      })
      it('sql with page 1', function(done){
        model.page(1).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT * FROM `meinv_group` LIMIT 0,20')
          done();
        })
      })
      it('sql with page, listRows', function(done){
        model.page(1, 10).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT * FROM `meinv_group` LIMIT 0,10')
          done();
        })
      })
      it('sql with page, listRows1', function(done){
        model.page(2, 10).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT * FROM `meinv_group` LIMIT 10,10')
          done();
        })
      })
      it('sql with error page', function(done){
        model.page('www').select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT * FROM `meinv_group` LIMIT 0,20')
          done();
        })
      })
      it('sql with error page,listRows', function(done){
        model.page('www', 'www').select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT * FROM `meinv_group` LIMIT 0,20')
          done();
        })
      })
    })


    describe('union', function(){
      var model = D('Pic1');
      it('union 1', function(done){
        model.union('select * from meinv_pic2').select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT * FROM `meinv_pic1` UNION (select * from meinv_pic2)')
          done();
        })
      })
      it('union all', function(done){
        model.union('select * from meinv_pic2', true).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT * FROM `meinv_pic1` UNION ALL (select * from meinv_pic2)')
          done();
        })
      })
      it('union all2', function(done){
        model.union({
          table: 'meinv_pic2',
        }, true).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT * FROM `meinv_pic1` UNION ALL (SELECT * FROM `meinv_pic2`)')
          done();
        })
      })
      it('union all3', function(done){
        model.union({
          table: 'meinv_pic2',
        }, true).union('select * from meinv_pic3').select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT * FROM `meinv_pic1` UNION ALL (SELECT * FROM `meinv_pic2`) UNION (select * from meinv_pic3)')
          done();
        })
      })
    })

    describe('join', function(){
      it('join', function(done){
        model.join('xxx').select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT * FROM `meinv_group` LEFT JOIN xxx')
          done();
        })
      })
      it('join on', function(done){
        model.join('meinv_xxx ON meinv_group.id = meinv_xxx.group_id').select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT * FROM `meinv_group` LEFT JOIN meinv_xxx ON meinv_group.id = meinv_xxx.group_id')
          done();
        })
      })
      it('join on arr', function(done){
        model.join(['meinv_xxx ON meinv_group.id = meinv_xxx.group_id', 'meinv_xxx ON meinv_group.id = meinv_xxx.group_id']).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT * FROM `meinv_group` LEFT JOIN meinv_xxx ON meinv_group.id = meinv_xxx.group_id LEFT JOIN meinv_xxx ON meinv_group.id = meinv_xxx.group_id')
          done();
        })
      })
      it('right join on', function(done){
        model.join('RIGHT JOIN meinv_xxx ON meinv_group.id = meinv_xxx.group_id').select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT * FROM `meinv_group` RIGHT JOIN meinv_xxx ON meinv_group.id = meinv_xxx.group_id')
          done();
        })
      })
      it('inner join on', function(done){
        model.join('INNER JOIN meinv_xxx ON meinv_group.id = meinv_xxx.group_id').select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT * FROM `meinv_group` INNER JOIN meinv_xxx ON meinv_group.id = meinv_xxx.group_id')
          done();
        })
      })
      it('join on', function(done){
        model.join({
          table: 'cate',
          as: 'c',
          on: ['id', 'id']
        }).select().then(function(){
          var sql = model.getLastSql().trim();
          assert.equal(sql, 'SELECT * FROM `meinv_group` LEFT JOIN `meinv_cate` AS c ON meinv_group.`id`=c.`id`')
          done();
        })
      })
      it('join on multi condition', function(done){
        model.join({
          table: 'cate',
          as: 'c',
          on: {id: 'id', title: 'name'}
        }).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT * FROM `meinv_group` LEFT JOIN `meinv_cate` AS c ON (meinv_group.`id`=c.`id` AND meinv_group.`title`=c.`name`)')
          done();
        })
      })
      it('right join on1', function(done){
        model.alias('a').join({
          table: 'cate',
          join: 'right',
          as: 'c',
          on: ['id', 'id']
        }).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT * FROM meinv_group AS a RIGHT JOIN `meinv_cate` AS c ON a.`id`=c.`id`')
          done();
        })
      })
      it('inner join', function(done){
        model.alias('a').join({
          table: 'cate',
          join: 'inner',
          as: 'c',
          on: ['id', 'id']
        }).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT * FROM meinv_group AS a INNER JOIN `meinv_cate` AS c ON a.`id`=c.`id`')
          done();
        })
      })
      it('multi join', function(done){
        model.alias('a').join({
          table: 'cate',
          join: 'left',
          as: 'c',
          on: ['id', 'id']
        }).join({
          table: 'group_tag',
          join: 'left',
          as: 'd',
          on: ['id', 'group_id']
        }).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT * FROM meinv_group AS a LEFT JOIN `meinv_cate` AS c ON a.`id`=c.`id` LEFT JOIN `meinv_group_tag` AS d ON a.`id`=d.`group_id`')
          done();
        })
      })
      it('multi join1', function(done){
        model.alias('a').join({
          cate: {
            join: 'left',
            as: 'c',
            on: ['id', 'id']
          },
          group_tag: {
            join: 'left',
            as: 'd',
            on: ['id', 'group_id']
          }
        }).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT * FROM meinv_group AS a LEFT JOIN `meinv_cate` AS c ON a.`id`=c.`id` LEFT JOIN `meinv_group_tag` AS d ON a.`id`=d.`group_id`')
          done();
        })
      })
      it('multi join2', function(done){
        model.join({
          cate: {
            join: 'left',
            as: 'c',
            on: ['id', 'id']
          },
          group_tag: {
            join: 'left',
            as: 'd',
            on: ['id', 'group_id']
          }
        }).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT * FROM `meinv_group` LEFT JOIN `meinv_cate` AS c ON meinv_group.`id`=c.`id` LEFT JOIN `meinv_group_tag` AS d ON meinv_group.`id`=d.`group_id`')
          done();
        })
      })
      it('multi join2', function(done){
        model.join({
          cate: {
            as: 'c',
            on: ['id', 'id']
          },
          group_tag: {
            as: 'd',
            on: ['id', 'group_id']
          }
        }).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT * FROM `meinv_group` LEFT JOIN `meinv_cate` AS c ON meinv_group.`id`=c.`id` LEFT JOIN `meinv_group_tag` AS d ON meinv_group.`id`=d.`group_id`')
          done();
        })
      })
      it('multi join3', function(done){
        model.join({
          cate: {
            on: ['id', 'id']
          },
          group_tag: {
            on: ['id', 'group_id']
          }
        }).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT * FROM `meinv_group` LEFT JOIN `meinv_cate` ON meinv_group.`id`=meinv_cate.`id` LEFT JOIN `meinv_group_tag` ON meinv_group.`id`=meinv_group_tag.`group_id`')
          done();
        })
      })
      it('multi join4', function(done){
        model.join({
          cate: {
            on: 'id,id'
          },
          group_tag: {
            on: ['id', 'group_id']
          }
        }).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT * FROM `meinv_group` LEFT JOIN `meinv_cate` ON meinv_group.`id`=meinv_cate.`id` LEFT JOIN `meinv_group_tag` ON meinv_group.`id`=meinv_group_tag.`group_id`')
          done();
        })
      })
      it('multi join5', function(done){
        model.join({
          cate: {
            on: 'id, id'
          },
          group_tag: {
            on: ['id', 'group_id']
          }
        }).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT * FROM `meinv_group` LEFT JOIN `meinv_cate` ON meinv_group.`id`=meinv_cate.`id` LEFT JOIN `meinv_group_tag` ON meinv_group.`id`=meinv_group_tag.`group_id`')
          done();
        })
      })

      it('multi join6', function(done){
        model.join({
          cate: {
            on: 'id, id'
          },
          group_tag: {
            on: ['id', 'group_id']
          },
          tag: {
            on: {
              id: 'id',
              title: 'name'
            }
          }
        }).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT * FROM `meinv_group` LEFT JOIN `meinv_cate` ON meinv_group.`id`=meinv_cate.`id` LEFT JOIN `meinv_group_tag` ON meinv_group.`id`=meinv_group_tag.`group_id` LEFT JOIN `meinv_tag` ON (meinv_group.`id`=meinv_tag.`id` AND meinv_group.`title`=meinv_tag.`name`)')
          done();
        })
      })

    })

    describe('table', function(){
      it('table', function(done){
        model.table('xxx').select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT * FROM `xxx`')
          done();
        })
      })
      it('table arr', function(done){
        model.table(['group', 'yyy']).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT * FROM `group`,`yyy`')
          done();
        })
      })
      it('table obj', function(done){
        model.table({group: 'a'}).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT * FROM `group` AS `a`')
          done();
        })
      })
    })

    describe('order', function(){
      it('order by id', function(done){
        model.order('id').select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT * FROM `meinv_group` ORDER BY id')
          done();
        })
      })
      it('order by id ASC', function(done){
        model.order('id ASC').select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT * FROM `meinv_group` ORDER BY id ASC')
          done();
        })
      })
      it('order by id DESC', function(done){
        model.order('id DESC').select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT * FROM `meinv_group` ORDER BY id DESC')
          done();
        })
      })
      it('order by id DESC,title ASC', function(done){
        model.order('id DESC,title ASC').select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT * FROM `meinv_group` ORDER BY id DESC,title ASC')
          done();
        })
      })
      it('order by arr', function(done){
        model.order(['id ASC']).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT * FROM `meinv_group` ORDER BY id ASC')
          done();
        })
      })
      it('order by arr', function(done){
        model.order(['id ASC', 'title DESC']).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT * FROM `meinv_group` ORDER BY id ASC,title DESC')
          done();
        })
      })
      it('order by obj', function(done){
        model.order({id: 'ASC'}).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT * FROM `meinv_group` ORDER BY `id` ASC')
          done();
        })
      })
      it('order by obj1', function(done){
        model.order({id: 'ASC', title: 'DESC'}).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT * FROM `meinv_group` ORDER BY `id` ASC,`title` DESC')
          done();
        })
      })
    })

    describe('alias', function(){
      it('table alias', function(done){
        model.alias('a').select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT * FROM meinv_group AS a')
          done();
        })
      })
    })
    describe('having', function(){
      it('having', function(done){
        model.having('view_nums > 1000').select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT * FROM `meinv_group` HAVING view_nums > 1000')
          done();
        })
      })
      it('having and', function(done){
        model.having('view_nums > 1000 AND view_nums < 2000').select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT * FROM `meinv_group` HAVING view_nums > 1000 AND view_nums < 2000')
          done();
        })
      })
    })

    describe('group', function(){
      it('group by title', function(done){
        model.group('title').select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT * FROM `meinv_group` GROUP BY `title`')
          done();
        })
      })
      it('group by view_nums', function(done){
        model.group('view_nums').select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT * FROM `meinv_group` GROUP BY `view_nums`')
          done();
        })
      })
    })

    describe('lock', function(){
      it('lock true', function(done){
        model.lock(true).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT * FROM `meinv_group`  FOR UPDATE')
          done();
        })
      })
      it('lock false', function(done){
        model.lock(false).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT * FROM `meinv_group`')
          done();
        })
      })
    })
    describe('distinct', function(){
      it('distinct:view_nums', function(done){
        model.distinct('view_nums').select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT Distinct  `view_nums` FROM `meinv_group`')
          done();
        })
      })
      it('distinct:title', function(done){
        model.distinct('title').select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT Distinct  `title` FROM `meinv_group`')
          done();
        })
      })
    })

    describe('where', function(){
      it('empty where', function(done){
        model.where().select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT * FROM `meinv_group`')
          done();
        })
      })
      it('empty where1', function(done){
        model.where('').select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT * FROM `meinv_group`')
          done();
        })
      })
      it('empty where2', function(done){
        model.where({}).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT * FROM `meinv_group`')
          done();
        })
      })
      it('where1', function(done){
        model.where({id: 10}).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT * FROM `meinv_group` WHERE ( `id` = 10 )')
          done();
        })
      })
      it('where =', function(done){
        model.where({id: ['=', 10]}).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT * FROM `meinv_group` WHERE ( `id` = 10 )')
          done();
        })
      })
      it('where EQ', function(done){
        model.where({id: ['EQ', 10]}).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT * FROM `meinv_group` WHERE ( `id` = 10 )')
          done();
        })
      })
      it('where eq', function(done){
        model.where({id: ['eq', 10]}).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT * FROM `meinv_group` WHERE ( `id` = 10 )')
          done();
        })
      })
      it('where field not exist', function(done){
        model.where({idxxx: 10}).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT * FROM `meinv_group`')
          done();
        })
      })
      it('where field with table alias', function(done){
        model.alias('c').where({'c.id': 10}).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT * FROM meinv_group AS c WHERE ( c.id = 10 )')
          done();
        })
      })
      it('where !=', function(done){
        model.where({id: ['!=', 10]}).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT * FROM `meinv_group` WHERE ( `id` != 10 )')
          done();
        })
      })
      it('where NEQ', function(done){
        model.where({id: ['NEQ', 10]}).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT * FROM `meinv_group` WHERE ( `id` != 10 )')
          done();
        })
      })
      it('where neq', function(done){
        model.where({id: ['neq', 10]}).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT * FROM `meinv_group` WHERE ( `id` != 10 )')
          done();
        })
      })
      it('where <>', function(done){
        model.where({id: ['<>', 10]}).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT * FROM `meinv_group` WHERE ( `id` != 10 )')
          done();
        })
      })

      it('where >', function(done){
        model.where({id: ['>', 10]}).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT * FROM `meinv_group` WHERE ( `id` > 10 )')
          done();
        })
      })
      it('where GT', function(done){
        model.where({id: ['GT', 10]}).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT * FROM `meinv_group` WHERE ( `id` > 10 )')
          done();
        })
      })
      it('where gt', function(done){
        model.where({id: ['gt', 10]}).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT * FROM `meinv_group` WHERE ( `id` > 10 )')
          done();
        })
      })
      it('where >=', function(done){
        model.where({id: ['>=', 10]}).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT * FROM `meinv_group` WHERE ( `id` >= 10 )')
          done();
        })
      })
      it('where EGT', function(done){
        model.where({id: ['EGT', 10]}).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT * FROM `meinv_group` WHERE ( `id` >= 10 )')
          done();
        })
      })
      it('where egt', function(done){
        model.where({id: ['egt', 10]}).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT * FROM `meinv_group` WHERE ( `id` >= 10 )')
          done();
        })
      })

      it('where <', function(done){
        model.where({id: ['<', 10]}).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT * FROM `meinv_group` WHERE ( `id` < 10 )')
          done();
        })
      })
      it('where LT', function(done){
        model.where({id: ['LT', 10]}).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT * FROM `meinv_group` WHERE ( `id` < 10 )')
          done();
        })
      })
      it('where lt', function(done){
        model.where({id: ['lt', 10]}).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT * FROM `meinv_group` WHERE ( `id` < 10 )')
          done();
        })
      })
      it('where <=', function(done){
        model.where({id: ['<=', 10]}).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT * FROM `meinv_group` WHERE ( `id` <= 10 )')
          done();
        })
      })
      it('where ELT', function(done){
        model.where({id: ['ELT', 10]}).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT * FROM `meinv_group` WHERE ( `id` <= 10 )')
          done();
        })
      })
      it('where elt', function(done){
        model.where({id: ['elt', 10]}).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT * FROM `meinv_group` WHERE ( `id` <= 10 )')
          done();
        })
      })
      it('where NOTLIKE', function(done){
        model.where({title: ['NOTLIKE', 'welefen']}).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, "SELECT * FROM `meinv_group` WHERE ( `title` NOT LIKE 'welefen' )")
          done();
        })
      })
      it('where NOT LIKE', function(done){
        model.where({title: ['NOT LIKE', 'welefen']}).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, "SELECT * FROM `meinv_group` WHERE ( `title` NOT LIKE 'welefen' )")
          done();
        })
      })
      it('where not like', function(done){
        model.where({title: ['not like', 'welefen']}).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, "SELECT * FROM `meinv_group` WHERE ( `title` NOT LIKE 'welefen' )")
          done();
        })
      })
      it('where not like with left %', function(done){
        model.where({title: ['not like', '%welefen']}).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, "SELECT * FROM `meinv_group` WHERE ( `title` NOT LIKE '%welefen' )")
          done();
        })
      })
      it('where not like with right %', function(done){
        model.where({title: ['not like', 'welefen%']}).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, "SELECT * FROM `meinv_group` WHERE ( `title` NOT LIKE 'welefen%' )")
          done();
        })
      })
      it('where not like with both %', function(done){
        model.where({title: ['not like', '%welefen%']}).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, "SELECT * FROM `meinv_group` WHERE ( `title` NOT LIKE '%welefen%' )")
          done();
        })
      })
      it('where LIKE', function(done){
        model.where({title: ['LIKE', 'welefen']}).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, "SELECT * FROM `meinv_group` WHERE ( `title` LIKE 'welefen' )")
          done();
        })
      })
      it('where like', function(done){
        model.where({title: ['like', 'welefen']}).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, "SELECT * FROM `meinv_group` WHERE ( `title` LIKE 'welefen' )")
          done();
        })
      })
      it('where like with left %', function(done){
        model.where({title: ['like', '%welefen']}).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, "SELECT * FROM `meinv_group` WHERE ( `title` LIKE '%welefen' )")
          done();
        })
      })
      it('where like with right %', function(done){
        model.where({title: ['like', 'welefen%']}).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, "SELECT * FROM `meinv_group` WHERE ( `title` LIKE 'welefen%' )")
          done();
        })
      })
      it('where like with both %', function(done){
        model.where({title: ['like', '%welefen%']}).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, "SELECT * FROM `meinv_group` WHERE ( `title` LIKE '%welefen%' )")
          done();
        })
      })
      it('where multi like', function(done){
        model.where({title: ['like', ['welefen']]}).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, "SELECT * FROM `meinv_group` WHERE ( (`title` LIKE 'welefen') )")
          done();
        })
      })
      it('where multi like1', function(done){
        model.where({title: ['like', ['welefen', 'suredy']]}).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, "SELECT * FROM `meinv_group` WHERE ( (`title` LIKE 'welefen' OR `title` LIKE 'suredy') )")
          done();
        })
      })
      it('where multi like2', function(done){
        model.where({title: ['like', ['welefen', '%suredy']]}).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, "SELECT * FROM `meinv_group` WHERE ( (`title` LIKE 'welefen' OR `title` LIKE '%suredy') )")
          done();
        })
      })
      it('where multi like3', function(done){
        model.where({title: ['like', ['%welefen', '%suredy%']]}).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, "SELECT * FROM `meinv_group` WHERE ( (`title` LIKE '%welefen' OR `title` LIKE '%suredy%') )")
          done();
        })
      })
      it('where multi like with AND logic', function(done){
        model.where({title: ['like', ['welefen', 'suredy'], 'AND']}).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, "SELECT * FROM `meinv_group` WHERE ( (`title` LIKE 'welefen' AND `title` LIKE 'suredy') )")
          done();
        })
      })
      it('where multi like with XOR logic', function(done){
        model.where({title: ['like', ['welefen', 'suredy'], 'XOR']}).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, "SELECT * FROM `meinv_group` WHERE ( (`title` LIKE 'welefen' XOR `title` LIKE 'suredy') )")
          done();
        })
      })
      it('where multi like with xor logic', function(done){
        model.where({title: ['like', ['welefen', 'suredy'], 'xor']}).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, "SELECT * FROM `meinv_group` WHERE ( (`title` LIKE 'welefen' XOR `title` LIKE 'suredy') )")
          done();
        })
      })




      it('where IN single value', function(done){
        model.where({id: ['IN', 10]}).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, "SELECT * FROM `meinv_group` WHERE ( `id` = 10 )")
          done();
        })
      })
      it('where IN string value', function(done){
        model.where({id: ['IN', '10,20']}).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, "SELECT * FROM `meinv_group` WHERE ( `id` IN ('10','20') )")
          done();
        })
      })
      it('where in string value', function(done){
        model.where({id: ['in', '10,20']}).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, "SELECT * FROM `meinv_group` WHERE ( `id` IN ('10','20') )")
          done();
        })
      })
      it('where IN arr value', function(done){
        model.where({id: ['IN', [10, 20]]}).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, "SELECT * FROM `meinv_group` WHERE ( `id` IN (10,20) )")
          done();
        })
      })
      it('where IN exp', function(done){
        model.where({id: ['IN', '(10,20)', 'exp']}).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, "SELECT * FROM `meinv_group` WHERE ( `id` IN (10,20) )")
          done();
        })
      })

      it('where NOT IN single value', function(done){
        model.where({id: ['NOT IN', 10]}).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, "SELECT * FROM `meinv_group` WHERE ( `id` != 10 )")
          done();
        })
      })
      it('where NOT IN string value', function(done){
        model.where({id: ['NOT IN', '10,20']}).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, "SELECT * FROM `meinv_group` WHERE ( `id` NOT IN ('10','20') )")
          done();
        })
      })
      it('where not in string value', function(done){
        model.where({id: ['not in', '10,20']}).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, "SELECT * FROM `meinv_group` WHERE ( `id` NOT IN ('10','20') )")
          done();
        })
      })
      it('where NOT IN arr value', function(done){
        model.where({id: ['NOTIN', [10, 20]]}).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, "SELECT * FROM `meinv_group` WHERE ( `id` NOT IN (10,20) )")
          done();
        })
      })
      it('where NOT IN exp', function(done){
        model.where({id: ['notin', '(10,20)', 'exp']}).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, "SELECT * FROM `meinv_group` WHERE ( `id` NOT IN (10,20) )")
          done();
        })
      })

      it('where exp', function(done){
        model.where({id: ['exp', '=10']}).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, "SELECT * FROM `meinv_group` WHERE ( (`id` =10) )")
          done();
        })
      })
      it('where EXP', function(done){
        model.where({id: ['exp', '=10']}).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, "SELECT * FROM `meinv_group` WHERE ( (`id` =10) )")
          done();
        })
      })



      it('where multi condition', function(done){
        model.where({id: 10, title: "www"}).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, "SELECT * FROM `meinv_group` WHERE ( `id` = 10 ) AND ( `title` = 'www' )")
          done();
        })
      })
      it('where multi condition with OR logic', function(done){
        model.where({id: 10, title: "www", _logic: 'OR'}).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, "SELECT * FROM `meinv_group` WHERE ( `id` = 10 ) OR ( `title` = 'www' )")
          done();
        })
      })
      it('where multi condition with or logic', function(done){
        model.where({id: 10, title: "www", _logic: 'or'}).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, "SELECT * FROM `meinv_group` WHERE ( `id` = 10 ) OR ( `title` = 'www' )")
          done();
        })
      })
      it('where multi condition with XOR logic', function(done){
        model.where({id: 10, title: "www", _logic: 'XOR'}).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, "SELECT * FROM `meinv_group` WHERE ( `id` = 10 ) XOR ( `title` = 'www' )")
          done();
        })
      })
      it('where multi condition with xor logic', function(done){
        model.where({id: 10, title: "www", _logic: 'xor'}).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, "SELECT * FROM `meinv_group` WHERE ( `id` = 10 ) XOR ( `title` = 'www' )")
          done();
        })
      })
      it('where string', function(done){
        model.where('id=10').select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, "SELECT * FROM `meinv_group` WHERE ( id=10 )")
          done();
        })
      })
      it('where string override', function(done){
        model.where('id=10').where('id=20').select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, "SELECT * FROM `meinv_group` WHERE ( id=20 )")
          done();
        })
      })
      it('where key has |', function(done){
        model.where({
          'id|title': 10
        }).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, "SELECT * FROM `meinv_group` WHERE ( (`id` = 10) OR (`title` = 10) )")
          done();
        })
      })
      it('where key has &', function(done){
        model.where({
          'id&title': 10
        }).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, "SELECT * FROM `meinv_group` WHERE ( (`id` = 10) AND (`title` = 10) )")
          done();
        })
      })

      it('where BETWEEN', function(done){
        model.where({id: ['BETWEEN', 1, 2]}).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, "SELECT * FROM `meinv_group` WHERE (  (`id` BETWEEN 1 AND 2) )")
          done();
        })
      })
      it('where between', function(done){
        model.where({id: ['between', 1, 2]}).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, "SELECT * FROM `meinv_group` WHERE (  (`id` BETWEEN 1 AND 2) )")
          done();
        })
      })
      it('where between string', function(done){
        model.where({id: ['between', '1,2']}).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, "SELECT * FROM `meinv_group` WHERE (  (`id` BETWEEN '1' AND '2') )")
          done();
        })
      })



      it('where obj for key value', function(done){
        model.where({id: {
          '>': 10,
          '<': 20
        }}).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, "SELECT * FROM `meinv_group` WHERE ( `id` > 10 AND `id` < 20 )")
          done();
        })
      })
      it('where obj for key value 1', function(done){
        model.where({id: {
          'GT': 10,
          'LT': 20
        }}).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, "SELECT * FROM `meinv_group` WHERE ( `id` > 10 AND `id` < 20 )")
          done();
        })
      })
      it('where obj for key value 2', function(done){
        model.where({id: {
          'GT': 10,
          '<=': 20
        }}).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, "SELECT * FROM `meinv_group` WHERE ( `id` > 10 AND `id` <= 20 )")
          done();
        })
      })
        it('where obj for key value 3', function(done){
        model.where({id: {
          'GT': 10,
          '<=': 20
        }, title: 'welefen'}).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, "SELECT * FROM `meinv_group` WHERE ( `id` > 10 AND `id` <= 20 ) AND ( `title` = 'welefen' )")
          done();
        })
      })
      it('where obj for key value with OR logic', function(done){
        model.where({id: {
          'GT': 10,
          'LT': 20,
          _logic: 'OR'
        }}).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, "SELECT * FROM `meinv_group` WHERE ( `id` > 10 OR `id` < 20 )")
          done();
        })
      })
      it('where obj for key value with OR logic', function(done){
        model.where({id: {
          'GT': 10,
          'LT': 20,
          _logic: 'OR'
        }, title: 'welefen'}).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, "SELECT * FROM `meinv_group` WHERE ( `id` > 10 OR `id` < 20 ) AND ( `title` = 'welefen' )")
          done();
        })
      })
      it('where extra', function(done){
        model.where({id: [['exp', '= 10 '], ['>', 10], ['<', 20]]}).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, "SELECT * FROM `meinv_group` WHERE ( (`id` = 10 ) AND (`id` > 10) AND (`id` < 20)  )")
          done();
        })
      })
      it('where mixed', function(done){
        model.where({id: {
          '>=': 10,
          '<=': 20
        }, 'title': ['like', '%welefen%'], date: ['>', '2014-08-12'], _logic: 'OR'}).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, "SELECT * FROM `meinv_group` WHERE ( `id` >= 10 AND `id` <= 20 ) OR ( `title` LIKE '%welefen%' ) OR ( `date` > '2014-08-12' )")
          done();
        })
      })
      it('where _complex', function(done){
        model.where({
          _complex: {
            id: ['IN', [1, 2, 3]]
          }
        }).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, "SELECT * FROM `meinv_group` WHERE (  ( `id` IN (1,2,3) ) )")
          done();
        })
      })





    })

  })
});
afterEach(function(){
  muk.restore();
})