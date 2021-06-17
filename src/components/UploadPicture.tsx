import React, { useState } from 'react'

import { Storage, API, graphqlOperation } from 'aws-amplify'
import Predictions from '@aws-amplify/predictions'
import { createPicture } from '../graphql/mutations'
import awsExports from '../aws-exports'
import { S_IFDIR } from 'constants'
import { listPictures } from '../graphql/queries'

function UploadImage() {
  const [images, setImages] = useState<{ id: string; src: string }[]>()
  //   const [fileSelected, setFileSelected] = React.useState<File>()
  //   const [files, setFiles] = React.useState<File[]>()
  //   const addImageToDB = async (image: {
  //     name: string
  //     file: { bucket: string; region: string; key: string }
  //   }) => {
  //     console.log('add image to db')
  //     try {
  //       await API.graphql(graphqlOperation(createPicture, { input: image }))
  //     } catch (error) {
  //       console.log(error)
  //     }
  //   }

  const buildImageArray = async (listPictures: any) => {
    return await getImagesFileList(listPictures)
  }

  const getImagesFileList = async (imageList: any) => {
    return Promise.all(
      imageList.map(
        async (i: { file: { key: string }; id: any; labels: any }) => {
          return getOneFormattedImage(i)
        },
      ),
    )
  }

  const getOneFormattedImage = async (image: {
    file: { key: string }
    id: any
    labels: any
  }) => {
    return {
      src: await Storage.get(image.file.key),
      id: image.id,
      labels: image.labels,
    }
  }

  const getAllImagesToState = async () => {
    const result: any = await API.graphql(graphqlOperation(listPictures))
    console.log(result)

    let imageArray: any = await buildImageArray(
      result?.data?.listPictures.items,
    )
    console.log(imageArray)
    setImages(imageArray)
  }

  const handleImageChange = function (e: React.ChangeEvent<HTMLInputElement>) {
    const fileList = e.target.files

    if (!fileList) return
    const file = fileList[0]
    console.log(fileList[0])
    console.log(URL.createObjectURL(file))
    // return

    Storage.put(file.name, file, {
      contentType: 'image/png',
    })
      .then(async () => {
        console.log(URL.createObjectURL(file))
        console.log(file)

        const image = {
          name: file.name,
          file: {
            bucket: awsExports.aws_user_files_s3_bucket,
            region: awsExports.aws_user_files_s3_bucket_region,
            key: file.name,
          },
        }

        try {
          await API.graphql(graphqlOperation(createPicture, { input: image }))
        } catch (error) {
          console.log(error)
        }
        console.log('added completed')
      })
      .catch((err) => console.log(err))
  }

  const displayStorage = () => {
    console.log('Hello Display anything?')

    Storage.list('').then((res) => {
      //   console.log(res)
      //   setFiles(res)
    })
  }

  return (
    <div>
      <div>
        <p>Please select an image to upload</p>
        <input type='file' onChange={(e) => handleImageChange(e)} />
      </div>
      <div>
        {/* <img src={URL.createObjectURL(fileSelected)} alt='game' /> */}
        <button onClick={displayStorage}>Click here storage</button>
        <button onClick={getAllImagesToState}>Click here for api</button>
      </div>
      {images?.map((image) => {
        return <img src={image.src} alt='game' />
      })}
    </div>
  )
}

export default UploadImage
