import { connectToDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import { NextRequest, NextResponse } from 'next/server'

// _id may be a real ObjectId or a custom string — query both ways.
function idQuery(id: string) {
    return ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { _id: id as any }
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { db } = await connectToDatabase()
        const { id } = await params
        const project = await db.collection('projects').findOne(idQuery(id))
        if (!project) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 })
        }
        return NextResponse.json(project)
    } catch (error) {
        console.error('GET /api/projects/[id] error:', error)
        return NextResponse.json({ error: 'Failed to fetch project' }, { status: 500 })
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { db } = await connectToDatabase()
        const { id } = await params
        const body = await request.json()

        const fields = [
            'name', 'type', 'fields', 'clientName', 'clientType', 'source',
            'startedAt', 'deadline', 'prodUrl', 'githubUrl', 'notes',
            'amount', 'currency', 'paid', 'color', 'additionalLinks',
        ]

        const updateData: Record<string, unknown> = { updatedAt: new Date().toISOString() }
        for (const f of fields) {
            if (body[f] !== undefined) updateData[f] = body[f]
        }

        if (body.status !== undefined) {
            updateData.status = body.status
            updateData.completedAt = body.status === 'completed' ? new Date().toISOString() : null
        }

        const result = await db.collection('projects').updateOne(
            idQuery(id),
            { $set: updateData }
        )

        if (result.matchedCount === 0) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 })
        }
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('PATCH /api/projects/[id] error:', error)
        return NextResponse.json({ error: 'Failed to update project' }, { status: 500 })
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { db } = await connectToDatabase()
        const { id } = await params
        const result = await db.collection('projects').deleteOne(idQuery(id))
        if (result.deletedCount === 0) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 })
        }
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('DELETE /api/projects/[id] error:', error)
        return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 })
    }
}
