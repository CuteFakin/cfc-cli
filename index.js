#!/usr/bin/env node
const ora = require('ora')
const { program } = require('commander')
const downloadGitRepo = require('download-git-repo')
const logSymbols = require('log-symbols')
const chalk = require('chalk')
const inquirer = require('inquirer')
const path = require('path');
const Handlebars = require('handlebars');
const fs = require('fs');
// 设置指令版本
program.version('1.0.0')

program
  .command('init')
  .arguments('<name>')
  .description('初始化 cf-cli 脚手架')
  .action((name) => {
    const targetPath = path.resolve(process.cwd(), name);
    if (fs.existsSync(targetPath)) {
      console.log(chalk.red("当前文件名已存在! 请重新输入!"));
      return;
    }
    inquirer.prompt([
      {
        name: "name",
        message: "项目名称："
      },
      {
        name: "description",
        message: "描述："
      }, {
        name: "author",
        message: "作者："
      },
      {
        type: 'list',
        name: 'frame',
        message: '选择要下载的模板',
        choices: ['cf-h5', 'cf-web'，'cf-admin']
      }
    ]).then((paramater) => {
      const targetPath = path.resolve(__dirname, name);
      console.log(paramater);
      // 在下载前提示
      const spinner = ora('正在下载模板...').start()
      const downLoadUrl = `github:CuteFakin/${paramater.frame}`
      downloadGitRepo(downLoadUrl, targetPath, { clone: true }, err => {
        if (err) {
          spinner.fail()
          return console.log(logSymbols.error, chalk.red('下载失败，失败原因：' + err));
        } else {
          spinner.succeed();
          const packagePath = path.join(targetPath, 'package.json');
          if (fs.existsSync(packagePath)) {
            const content = fs.readFileSync(packagePath).toString();
            const template = Handlebars.compile(content);
            const result = template(paramater);
            fs.writeFileSync(packagePath, result);
          } else {
            spinner.fail();
            console.log(chalk.red("failed! 没有package.json"));
            return
          }
          console.log(chalk.green("success！ 项目初始化成功") + '\n');
          console.log(
            chalk.greenBright("开启项目") + '\n' +
            chalk.greenBright("cd " + name) + '\n' +
            chalk.greenBright("npm run install") + '\n' +
            chalk.greenBright("npm run serve"));
        }
      })
    }).catch((error) => {
      console.log(chalk.red(error));
    })

  });

program
  .command('help')
  .description('查看帮助')
  .action(() => {
    console.log('什么帮助都没有，请自行摸索')
  })
program.parse(process.argv)