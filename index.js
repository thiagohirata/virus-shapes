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
//     { name: 'Debug', path_strs: ["M -10,-12 V 12"] },
// ]

const distanceOf = function (a, b) {
    return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2))
}

const BASE_RATE = 6
const SCALE = .3
const MIN_DIST = 4
const ADJUST = .1

for (let i = 0; i < shapes.length; i++) {
    const { name, path_strs } = shapes[i]
    const positions = []
    for (const path_str of path_strs) {
        const totalLength = raphael.getTotalLength(path_str);
        const pointCount = Math.floor((totalLength + ADJUST) / BASE_RATE);
        const rate = totalLength / pointCount
        for (var c = 0; c <= totalLength + ADJUST; c += rate) {
            var point = raphael.getPointAtLength(path_str, c);
            const position = {
                x: point.x,
                y: point.y * -1,
                z: 0
            }
            if (positions.find(p => distanceOf(position, p) < MIN_DIST) == null) {
                positions.push(position)
            }

        }
    }
    writeAsset(name, { scale: SCALE, positions: positions })
}
