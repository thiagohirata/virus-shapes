const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const { window } = new JSDOM(`<!DOCTYPE html><p>Hello world</p>`);
const { document } = window
const fs = require("fs");
Object.assign(global, { window, document })

require("amd-loader")
const raphael = require('raphael/dev/raphael.amd')
const yaml = require('yaml')
const xml = require('fast-xml-parser')
const base = yaml.parse(`
m_ObjectHideFlags: 0
m_CorrespondingSourceObject: {fileID: 0}
m_PrefabInstance: {fileID: 0}
m_PrefabAsset: {fileID: 0}
m_GameObject: {fileID: 0}
m_Enabled: 1
m_EditorHideFlags: 0
m_Script: {fileID: 11500000, guid: ad079eae81348104c96f5ff56ad7ac73, type: 3}
m_Name: LetterD
m_EditorClassIdentifier: null
`)

const writeAsset = function (name, obj) {
    const content = `%YAML 1.1
%TAG !u! tag:unity3d.com,2011:
--- !u!114 &11400000    
${yaml.stringify({ MonoBehaviour: { ...base, ...obj, ...{ m_Name: name } } }, { version: '1.1' })}`
    fs.writeFileSync(`output/${name}.asset`, content)
}


const shapesXml = fs.readFileSync('shapes.svg', {
    encoding: 'utf-8',
})
const svg = xml.parse(shapesXml, { ignoreAttributes: false, arrayMode: "strict" }).svg[0]
const shapes = svg.g[0].path.map(shape => ({ name: shape['@_id'], path_strs: [shape['@_d']] }))
if (svg.g[0].g) {
    shapes.push(...svg.g[0].g.map(group => ({ name: group['@_id'], path_strs: group.path.map(shape => shape['@_d']) })))
}
// const shapes = [
//     { name: 'LetterD', d: "m -2.6458333,-13.229167 c 7.9375,0 14.5520833,5.29167 14.5520833,13.2291700333333 C 11.90625,9.2604133 6.6145837,14.552083 -2.6458333,14.552083 h -7.9374997 v -27.78125 z" },
//     { name: 'LetterC', d: "m 10.583333,-10.4775 c 0,0 -5.2916651,-2.487082 -9.2604151,-2.487083 -3.96875,-1e-6 -13.2291679,1.243542 -13.2291679,13.67895758 0,12.43541842 9.2604179,13.67895842 13.2291679,13.67895842 3.96875,0 9.2604151,-2.487083 9.2604151,-2.487083" },
// ]

const distanceOf = function (a, b) {
    return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2))
}

const BASE_RATE = 8
const SCALE = .3
for (let i = 0; i < shapes.length; i++) {
    const { name, path_strs } = shapes[i]
    const positions = []
    for (const path_str of path_strs) {
        const totalLength = raphael.getTotalLength(path_str);
        const pointCount = Math.ceil(totalLength / BASE_RATE)
        const rate = totalLength / pointCount
        for (var c = 0; c <= totalLength; c += rate) {
            var point = raphael.getPointAtLength(path_str, c);
            const position = {
                x: point.x,
                y: point.y * -1,
                z: 0
            }
            if (positions.find(p => distanceOf(position, p) < .5 *BASE_RATE) == null) {
                positions.push(position)
            }

        }
    }
    writeAsset(name, { scale: SCALE, positions: positions })
}
